import { AuthService } from "@blazell/api";
import { Authentication } from "@blazell/auth/src";
import { schema } from "@blazell/db";
import { Cloudflare, Database } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import type { AuthUser, GoogleProfile, InsertAuth } from "@blazell/validators";
import {
	PrepareVerificationSchema,
	VerifyOTPSchema,
	type Bindings,
	type Env,
} from "@blazell/validators";
import { HttpClient, HttpClientRequest } from "@effect/platform";
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
import { z } from "zod";
import { getDB } from "../lib/db";

const app = new Hono<{ Bindings: Bindings & Env }>()
	.post(
		"/prepare-verification",
		zValidator("json", PrepareVerificationSchema),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { email, redirectTo } = c.req.valid("json");

			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
				columns: {
					id: true,
				},
			});

			const { emailVerifyURL, otp } = await Effect.runPromise(
				AuthService.prepareVerification({
					target: email,
					...(!user
						? {
								redirectTo: `${new URL(c.req.url).origin}/onboarding`,
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
			console.log("server url", `${c.env.SERVER_URL}/emails/verify-otp`);

			const { status } = await Effect.runPromise(
				HttpClientRequest.post(`${c.env.SERVER_URL}/emails/verify-otp`).pipe(
					HttpClientRequest.jsonBody({
						otp,
						email,
						emailVerifyURL: emailVerifyURL.toString(),
					}),
					Effect.andThen(HttpClient.fetchOk),
					Effect.scoped,
					Effect.catchAll((error) =>
						Effect.sync(() => {
							console.error(error.toString());
							return {
								status: "error",
							};
						}),
					),
				),
			);
			if (status === "error") {
				return c.json(
					{
						status: "error",
					},
					500,
				);
			}

			return c.json({});
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
					user: true,
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
		"/user-session/:authID",
		zValidator("param", z.object({ authID: z.string() })),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { authID } = c.req.valid("param");

			await db
				.delete(schema.sessions)
				.where(eq(schema.sessions.authID, authID));

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
				authID: z.string(),
				expiresAt: z.string(),
			}),
		),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const { authID, expiresAt } = c.req.valid("json");
			const session = {
				id: generateID({ prefix: "session" }),
				authID,
				createdAt: new Date().toISOString(),
				expiresAt,
			};

			await db.insert(schema.sessions).values(session).returning();
			return c.json({ session }, 200);
		},
	)
	.post("/verify-otp", zValidator("json", VerifyOTPSchema), async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const { otp, target } = c.req.valid("json");
		const url = new URL(c.req.url);
		const origin = url.origin;
		const validationResult = await Effect.runPromise(
			AuthService.verifyOTP({ otp, target }).pipe(
				Effect.provideService(Database, { manager: db }),
			),
		);

		if (!validationResult) {
			return c.json(
				{
					status: "success",
					valid: false,
					onboard: false,
					session: null,
				},
				200,
			);
		}

		let authUser: InsertAuth | undefined | AuthUser =
			await db.query.authUsers.findFirst({
				where: (authUsers, { eq }) => eq(authUsers.email, target),
			});

		if (!authUser) {
			const newUser = {
				id: generateID({ prefix: "user" }),
				email: target,
				createdAt: new Date().toISOString(),
				version: 1,
			};
			await db.insert(schema.authUsers).values(newUser).onConflictDoNothing();
			authUser = newUser;
		}

		const auth = Authentication({ serverURL: origin });
		const userSession = await auth.createSession(authUser.id);
		return c.json(
			{
				status: "success",
				valid: true,
				onboard: !authUser.username,
				session: userSession,
			},
			200,
		);
	})
	.get("/google", async (c) => {
		const url = new URL(c.req.url);
		const origin = url.origin;
		const google = new Google(
			c.env.GOOGLE_CLIENT_ID,
			c.env.GOOGLE_CLIENT_SECRET,
			`${origin}/google/callback`,
		);
		const state = generateState();
		const codeVerifier = generateCodeVerifier();
		const googleURL = await google.createAuthorizationURL(state, codeVerifier, {
			scopes: ["openid", "email", "profile"],
		});
		return c.json(
			{
				status: "success",
				state,
				codeVerifier,
				url: googleURL,
			},
			200,
		);
	})
	.get(
		"/google/callback",
		zValidator(
			"query",
			z.object({
				code: z.string(),
				codeVerifier: z.string(),
			}),
		),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const url = new URL(c.req.url);
			const origin = url.origin;

			const { code, codeVerifier } = c.req.valid("query");

			try {
				const google = new Google(
					c.env.GOOGLE_CLIENT_ID,
					c.env.GOOGLE_CLIENT_SECRET,
					`${origin}/google/callback`,
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
				const googleUserResult: GoogleProfile = await googleUserResponse.json();
				let onboard = false;

				let authUser = await db.query.authUsers.findFirst({
					where: (authUsers, { eq, or }) =>
						or(
							eq(authUsers.googleID, googleUserResult.sub),
							eq(authUsers.email, googleUserResult.email),
						),
				});

				if (!authUser) {
					onboard = true;
					const [newAuthUser] = await db
						.insert(schema.authUsers)
						.values({
							id: generateID({ prefix: "user" }),
							googleID: googleUserResult.sub,
							email: googleUserResult.email,
							...(googleUserResult.picture && {
								avatar: googleUserResult.picture,
							}),
							...(googleUserResult.name && { fullName: googleUserResult.name }),
							createdAt: new Date().toISOString(),
							version: 1,
						})
						.returning();
					if (newAuthUser) {
						authUser = newAuthUser;
					} else {
						return c.json(
							{
								status: "error",
								onboard: false,
								session: null,
							},
							{
								status: 500,
							},
						);
					}
				}

				const auth = Authentication({
					serverURL: origin,
				});

				const userSession = await auth.createSession(authUser.id);
				return c.json({
					status: "success",
					onboard,
					session: userSession,
				});
			} catch (e) {
				console.log(e);
				if (e instanceof OAuth2RequestError) {
					// bad verification code, invalid credentials, etc
					return c.json(
						{
							status: "error",
							onboard: false,
							session: null,
						},
						400,
					);
				}

				return c.json(
					{
						status: "error",
						onboard: false,
						session: null,
					},
					500,
				);
			}
		},
	);
export default app;
