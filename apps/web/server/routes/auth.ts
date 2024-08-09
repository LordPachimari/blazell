import { AuthService } from "@blazell/api";
import { schema } from "@blazell/db";
import { Cloudflare, Database } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import type { Bindings, Env } from "@blazell/validators";
import type { GoogleProfile } from "@blazell/validators";
import { zValidator } from "@hono/zod-validator";
import {
	generateCodeVerifier,
	generateState,
	Google,
	OAuth2RequestError,
} from "arctic";
import { eq, lte } from "drizzle-orm";
import { Effect } from "effect";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { getCookie } from "hono/cookie";
import { serializeCookie } from "oslo/cookie";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { z } from "zod";
import { getDB } from "../lib/db";
import { getOtpHTML } from "../emails/verification";

const app = new Hono<{ Bindings: Bindings & Env }>()
	.post(
		"/prepare-verification",
		zValidator(
			"json",
			z.object({
				email: z.string(),
				redirectTo: z.string().optional(),
			}),
		),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { email, redirectTo } = c.req.valid("json");

			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
				columns: {
					id: true,
				},
			});

			const { emailVerifyURL, otp, verifyURL } = await Effect.runPromise(
				AuthService.prepareVerification({
					period: 10 * 60,
					target: email,
					...(!user
						? {
								redirectTo: `${
									c.env.ENVIRONMENT === "production"
										? "https://blazell.com"
										: c.env.ENVIRONMENT === "development"
											? "https://development.blazell.pages.dev"
											: "http://localhost:5173"
								}/onboarding`,
							}
						: redirectTo && { redirectTo }),
				}).pipe(
					Effect.provideService(Database, { manager: db }),
					Effect.provideService(
						Cloudflare,
						Cloudflare.of({
							env: c.env,
							headers: c.req.raw.headers,
							request: c.req.raw,
						}),
					),
				),
			);
			console.log("Generated OTP", otp);
			console.log("Generated Verify URL", verifyURL);
			// Initialize the SES client
			const sesClient = new SESClient({
				region: "ap-southeast-2", // replace with your region
				credentials: {
					accessKeyId: c.env.AWS_EMAIL_ACCESS_KEY,
					secretAccessKey: c.env.AWS_EMAIL_SECRET_KEY,
				},
			});
			const params = {
				Destination: {
					ToAddresses: [email],
				},
				Message: {
					Body: {
						Html: {
							Charset: "UTF-8",
							Data: await getOtpHTML({
								otp,
								verifyURL: emailVerifyURL.toString(),
							}),
						},
					},
					Subject: {
						Data: "Verify your email",
					},
				},
				Source: "blazell.com",
			};
			try {
				const command = new SendEmailCommand(params);
				await sesClient.send(command);

				return c.json({ verifyURL }, 200);
			} catch (error) {
				console.error("Error sending email:", error);
				return c.json({ error: "Failed to send email" }, 500);
			}
		},
	)
	.get(
		"/user-session",
		zValidator(
			"query",
			z.object({
				sessionID: z.string(),
			}),
		),
		cache({
			cacheName: "user-session",
			cacheControl: "private, max-age=2592000",
		}),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { sessionID } = c.req.valid("query");

			const session = await db.query.sessions.findFirst({
				where: (sessions, { eq }) => eq(sessions.id, sessionID),
				with: {
					user: {
						columns: {
							id: true,
							email: true,
							username: true,
						},
					},
				},
			});

			return c.json({ user: session?.user, session }, 200);
		},
	)
	.delete(
		"/session/:id",
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { id } = c.req.valid("param");

			await db.delete(schema.sessions).where(eq(schema.sessions.id, id));

			return c.json({ id }, 200);
		},
	)
	.delete(
		"/user-session/:userID",
		zValidator("param", z.object({ userID: z.string() })),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { userID } = c.req.valid("param");

			await db
				.delete(schema.sessions)
				.where(eq(schema.sessions.userID, userID));

			return c.json({}, 200);
		},
	)
	.delete("/expired-sessions", async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });

		await db
			.delete(schema.sessions)
			.where(lte(schema.sessions.expiresAt, new Date().toISOString()));

		return c.json({});
	})
	.post(
		"/create-session",
		zValidator(
			"json",
			z.object({
				userID: z.string(),
				expiresAt: z.string(),
			}),
		),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { userID, expiresAt } = c.req.valid("json");
			const session = {
				id: generateID({ prefix: "session" }),
				userID,
				createdAt: new Date().toISOString(),
				expiresAt,
			};

			await db.insert(schema.sessions).values(session).returning();
			return c.json({ session }, 200);
		},
	)
	.post(
		"/verify",
		zValidator("json", z.object({ otp: z.string(), target: z.string() })),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { otp, target } = c.req.valid("json");
			const validationResult = await Effect.runPromise(
				AuthService.verifyOTP({ otp, target }).pipe(
					Effect.provideService(Database, { manager: db }),
				),
			);
			return c.json({ valid: validationResult }, 200);
		},
	)
	.get("/login/google", async (c) => {
		const google = new Google(
			c.env.GOOGLE_CLIENT_ID,
			c.env.GOOGLE_CLIENT_SECRET,
			`${
				c.env.ENVIRONMENT === "production"
					? "https://blazell.com"
					: c.env.ENVIRONMENT === "development"
						? "https://development.blazell.pages.dev"
						: "http://localhost:5173"
			}/google/callback`,
		);
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const url = await google.createAuthorizationURL(state, codeVerifier, {
			scopes: ["./auth/userinfo.email", "./auth/userinfo.profile"],
		});
		c.header(
			"Set-Cookie",
			serializeCookie("google_oauth_state", state, {
				httpOnly: true,
				secure: c.env.ENVIRONMENT === "production", // set `Secure` flag in HTTPS
				maxAge: 60 * 10, // 10 minutes
				path: "/",
			}),
		);
		c.header(
			"Set-Cookie",
			serializeCookie("code_verifier", codeVerifier, {
				httpOnly: true,
				secure: c.env.ENVIRONMENT === "production",
				maxAge: 60 * 10,
				path: "/",
			}),
		);
		return c.json(
			{
				state,
				codeVerifier,
				url,
			},
			200,
		);
	})
	.get(
		"/login/google/callback",
		zValidator(
			"query",
			z.object({
				state: z.string(),
				code: z.string(),
			}),
		),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const stateCookie = getCookie(c, "google_oauth_state") ?? null;
			const codeVerifier = getCookie(c, "code_verifier") ?? null;

			const state = c.req.query("state");
			const code = c.req.query("code");

			// verify state
			if (
				!state ||
				!stateCookie ||
				!code ||
				stateCookie !== state ||
				codeVerifier === null
			) {
				return c.text("Unauthorized", {
					status: 400,
				});
			}

			try {
				const google = new Google(
					c.env.GOOGLE_CLIENT_ID,
					c.env.GOOGLE_CLIENT_SECRET,
					`${
						c.env.ENVIRONMENT === "production"
							? "https://blazell.com"
							: c.env.ENVIRONMENT === "development"
								? "https://development.blazell.pages.dev"
								: "http://localhost:5173"
					}/google/callback`,
				);
				const tokens = await google.validateAuthorizationCode(
					code,
					codeVerifier,
				);
				const googleUserResponse = await fetch(
					"https://www.googleapis.com/oauth2/v3/userinfo",
					{
						headers: {
							Authorization: `Bearer ${tokens.accessToken}`,
						},
					},
				);
				const githubUserResult: GoogleProfile = await googleUserResponse.json();
				let signUp = false;

				let existingUser = await db.query.users.findFirst({
					where: (users, { eq }) => eq(users.google_id, githubUserResult.sub),
				});

				if (!existingUser) {
					signUp = true;
					const [newUser] = await db
						.insert(schema.users)
						//@ts-ignore
						.values({
							id: generateID({ prefix: "user" }),
							google_id: githubUserResult.sub,
							email: githubUserResult.email,
							fullName: githubUserResult.name,
						})
						.returning();
					if (newUser) {
						existingUser = newUser;
					} else {
						return c.json(
							{ type: "ERROR", message: "Error creating user" },
							500,
						);
					}
				}
				return c.json({ type: "SUCCESS", signUp, user: existingUser }, 200);
			} catch (e) {
				console.log(e);
				if (e instanceof OAuth2RequestError) {
					// bad verification code, invalid credentials, etc
					return c.json(
						{
							type: "ERROR" as const,
							message: "Bad verification code. Invalid credentials",
						},
						400,
					);
				}

				return c.json(
					{ type: "ERROR" as const, message: "Error validating" },
					500,
				);
			}
		},
	);
export default app;
