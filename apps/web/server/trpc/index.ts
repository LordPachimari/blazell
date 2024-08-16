import { AuthService } from "@blazell/api";
import { verifyOTP } from "@blazell/api/src/services/auth";
import { schema } from "@blazell/db";
import { Cloudflare, Database } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import {
	PrepareVerificationSchema,
	type AuthUser,
	type Env,
	type GoogleProfile,
	type InsertAuth,
} from "@blazell/validators";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { initTRPC } from "@trpc/server";
import { generateCodeVerifier, generateState, Google } from "arctic";
import { eq, lte } from "drizzle-orm";
import { Effect } from "effect";
import { createDate, TimeSpan } from "oslo";
import { getDB } from "server/lib/db";
import { z } from "zod";
export type TRPCContext = {
	env: Env;
	request: Request;
	authUser: AuthUser | null;
	bindings: {
		KV: KVNamespace;
	};
};
const t = initTRPC.context<TRPCContext>().create();

export const publicProcedure = t.procedure;
export const router = t.router;
const createCallerFactory = t.createCallerFactory;

const helloRouter = router({
	hello: publicProcedure.query(() => {
		return "hello";
	}),
});
const authRouter = router({
	userAndSession: publicProcedure
		.input(z.object({ sessionID: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { sessionID } = input;
			const session = await db.query.sessions.findFirst({
				where: (sessions, { eq }) => eq(sessions.id, sessionID),
				with: {
					user: true,
				},
			});
			return { user: session?.user, session };
		}),
	createSession: publicProcedure
		.input(z.object({ authID: z.string(), expiresAt: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { authID, expiresAt } = input;
			const session = {
				id: generateID({ prefix: "session" }),
				authID,
				createdAt: new Date().toISOString(),
				expiresAt,
			};
			await db.insert(schema.sessions).values(session).returning();
			return session;
		}),
	deleteSession: publicProcedure
		.input(z.object({ sessionID: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { sessionID } = input;
			await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionID));
			return sessionID;
		}),
	deleteExpiredSessions: publicProcedure.mutation(async ({ ctx }) => {
		const db = getDB({ connectionString: ctx.env.DATABASE_URL });
		await db
			.delete(schema.sessions)
			.where(lte(schema.sessions.expiresAt, new Date().toISOString()));
	}),
	prepareVerification: publicProcedure
		.input(PrepareVerificationSchema)
		.query(async ({ ctx, input }) => {
			const { env, request, bindings } = ctx;
			const { email, redirectTo } = input;
			const db = getDB({ connectionString: env.DATABASE_URL });

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
								redirectTo: `${new URL(request.url).origin}/onboarding`,
							}
						: redirectTo && { redirectTo }),
				}).pipe(
					Effect.provideService(Database, { manager: db }),
					Effect.provideService(
						Cloudflare,
						Cloudflare.of({
							env,
							request,
							bindings: {
								KV: bindings.KV,
							},
						}),
					),
				),
			);
			console.log("Generated OTP", otp);
			console.log("server url", `${env.SERVER_URL}/emails/verify-otp`);

			const { status } = await Effect.runPromise(
				HttpClientRequest.post(`${env.SERVER_URL}/emails/verify-otp`).pipe(
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
								status: "error" as const,
								message: "Failed to send email",
							};
						}),
					),
				),
			);
			if (status === "error") {
				return { status: "error" as const, message: "Failed to send email" };
			}

			return { status: "success" as const };
		}),
	verifyOTP: publicProcedure
		.input(z.object({ otp: z.string(), target: z.string() }))
		.query(async ({ ctx, input }) => {
			const { env } = ctx;
			const db = getDB({ connectionString: env.DATABASE_URL });
			const { otp, target } = input;
			const validationResult = await Effect.runPromise(
				verifyOTP({ otp, target }).pipe(
					Effect.provideService(Database, { manager: db }),
				),
			);

			if (!validationResult) {
				return {
					valid: false,
				};
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

			const sessionExpiresIn = new TimeSpan(30, "d");
			const expiresAt = createDate(sessionExpiresIn).toISOString();
			const session = {
				id: generateID({ prefix: "session" }),
				authID: authUser.id,
				createdAt: new Date().toISOString(),
				expiresAt,
			};
			await db.insert(schema.sessions).values(session).returning();
			return {
				valid: true,
				onboard: !authUser.username,
				session,
			};
		}),
	google: publicProcedure.query(async ({ ctx }) => {
		const { request, env } = ctx;
		const url = new URL(request.url);
		const origin = url.origin;
		const google = new Google(
			env.GOOGLE_CLIENT_ID,
			env.GOOGLE_CLIENT_SECRET,
			`${origin}/google/callback`,
		);
		const state = generateState();
		const codeVerifier = generateCodeVerifier();

		try {
			const googleURL = await google.createAuthorizationURL(
				state,
				codeVerifier,
				{
					scopes: ["openid", "email", "profile"],
				},
			);

			return {
				status: "success",
				state,
				codeVerifier,
				url: googleURL.toString(),
			};
		} catch (error) {
			console.error(error);
			return {
				status: "error",
			};
		}
	}),

	googleCallback: publicProcedure
		.input(
			z.object({
				code: z.string(),
				codeVerifier: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const url = new URL(ctx.request.url);
			const origin = url.origin;

			const { code, codeVerifier } = input;

			try {
				const google = new Google(
					ctx.env.GOOGLE_CLIENT_ID,
					ctx.env.GOOGLE_CLIENT_SECRET,
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
						throw new Error("Failed to create user");
					}
				}

				const sessionExpiresIn = new TimeSpan(30, "d");
				const expiresAt = createDate(sessionExpiresIn).toISOString();
				const session = {
					id: generateID({ prefix: "session" }),
					authID: authUser.id,
					createdAt: new Date().toISOString(),
					expiresAt,
				};
				await db.insert(schema.sessions).values(session).returning();
				return {
					status: "success",
					onboard,
					session,
				};
			} catch (error) {
				console.error(error);
				return {
					status: "error",
				};
			}
		}),
});
export const appRouter = router({
	hello: helloRouter,
	auth: authRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
