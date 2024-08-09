import { ReplicacheContext, pull, push, staticPull } from "@blazell/replicache";
import { AuthContext, Cloudflare, Database } from "@blazell/shared";
import {
	BindingsSchema,
	PullRequest,
	PushRequest,
	SpaceIDSchema,
	type Auth,
	type AuthSession,
	type Bindings,
	type Env,
	type SpaceRecord,
} from "@blazell/validators";
import { Schema } from "@effect/schema";
import {
	createWorkersKVSessionStorage,
	type RequestHandler,
} from "@remix-run/cloudflare";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
// import { staticAssets } from "remix-hono/cloudflare";
import { remix } from "remix-hono/handler";
import { getSession, getSessionStorage, session } from "remix-hono/session";
import { Authentication } from "./auth";
import { getDB } from "./lib/db";
import auth from "./routes/auth";
import carts from "./routes/carts";
import orders from "./routes/orders";
import products from "./routes/products";
import stores from "./routes/stores";
import users from "./routes/users";
import variants from "./routes/variants";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { typedEnv } from "remix-hono/typed-env";
import { getUserAndSession } from "~/server/auth.server";

const app = new Hono<{ Bindings: Bindings & Env }>();

let handler: RequestHandler | undefined;

const routes = app
	.use("*", async (c, next) => {
		const wrapped = cors({
			origin:
				c.env.ENVIRONMENT === "production"
					? "https://blazell.com"
					: c.env.ENVIRONMENT === "development"
						? ["https://development.blazell.pages.dev"]
						: [
								"http://localhost:5173",
								"https://development.blazell.pages.dev",
								"https://blazell.com",
								"http://localhost:8788",
							],

			allowMethods: ["POST", "GET", "OPTIONS"],
			maxAge: 600,
			credentials: true,
		});
		return wrapped(c, next);
	})
	.use("*", async (c, next) => {
		const wrapped = csrf({
			origin:
				c.env.ENVIRONMENT === "production"
					? "https://blazell.com"
					: c.env.ENVIRONMENT === "development"
						? ["https://development.blazell.pages.dev"]
						: [
								"http://localhost:5173",
								"https://development.blazell.pages.dev",
								"https://blazell.com",
								"http://localhost:8788",
							],
		});
		return wrapped(c, next);
	})
	.use(
		"*",
		// staticAssets(),
		session({
			autoCommit: true,
			createSessionStorage(c) {
				return createWorkersKVSessionStorage({
					kv: c.env.KV,
					cookie: {
						name: "auth_session",
						httpOnly: true,
						secrets: [c.env.SESSION_SECRET ?? "WEAK_SECRET"],
						secure: c.env.ENVIRONMENT === "production",
					},
				});
			},
		}),
		// async (c, next) => {
		// 	if (process.env.NODE_ENV === "production" || import.meta.env.PROD) {
		// 		return staticAssets()(c, next);
		// 	}
		// 	await next();
		// },

		async (c, next) => {
			const auth = new Authentication({
				serverURL: c.env.WORKER_URL,
			});
			const honoSession = getSession(c);

			const sessionID = honoSession.get(auth.sessionCookieName);
			console.log("sessionId", sessionID);
			if (!sessionID) {
				c.set("auth" as never, {
					user: null,
					session: null,
				});
				return next();
			}

			let currentSession: AuthSession | undefined;
			const { session, user } = await auth.validateSession(sessionID);
			if (session && !session.fresh && user) {
				await auth.invalidateSession(session.id);
				const newSession = await auth.createSession(user.id);
				honoSession.set(auth.sessionCookieName, newSession);
				currentSession = newSession;
			}
			if (session) currentSession = session;

			c.set("auth" as never, {
				user,
				session: currentSession,
			});

			return next();
		},
	)
	.post("/api/pull/:spaceID", async (c) => {
		// 1: PARSE INPUT
		const auth = c.get("auth" as never) as Auth;
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const subspaceIDs = c.req.queries("subspaces");
		const spaceID = Schema.decodeUnknownSync(SpaceIDSchema)(
			c.req.param("spaceID"),
		);
		const body = PullRequest.decodeUnknownSync(await c.req.json());
		console.log("subspaceIDs", subspaceIDs);

		const CloudflareLive = Layer.succeed(
			Cloudflare,
			Cloudflare.of({
				headers: c.req.raw.headers,
				env: c.env,
				request: c.req.raw,
			}),
		);
		const ReplicacheContextLive = Layer.succeed(
			ReplicacheContext,
			ReplicacheContext.of({
				spaceID,
				clientGroupID: body.clientGroupID,
				subspaceIDs: subspaceIDs as SpaceRecord[typeof spaceID] | undefined,
			}),
		);

		const AuthContextLive = Layer.succeed(
			AuthContext,
			AuthContext.of({
				auth,
			}),
		);

		// 2: PULL
		const pullEffect = pull({
			body,
			db,
		}).pipe(
			Effect.provide(AuthContextLive),
			Effect.provide(CloudflareLive),
			Effect.provide(ReplicacheContextLive),
			Effect.orDie,
		);

		// 3: RUN PROMISE
		const pullResponse = await Effect.runPromise(pullEffect);

		return c.json(pullResponse, 200);
	})
	.post("/api/static-pull", async (c) => {
		// 1: PARSE INPUT
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const body = PullRequest.decodeUnknownSync(await c.req.json());

		// 2: PULL
		const pullEffect = staticPull({ body }).pipe(
			Effect.provideService(Database, { manager: db }),
			Effect.provideService(
				Cloudflare,
				Cloudflare.of({
					env: c.env,
					headers: c.req.raw.headers,
					request: c.req.raw,
				}),
			),
			Effect.orDie,
		);

		// 3: RUN PROMISE
		const pullResponse = await Effect.runPromise(pullEffect);

		return c.json(pullResponse, 200);
	})
	.post("/api/push/:spaceID", async (c) => {
		// 1: PARSE INPUT
		const auth = c.get("auth" as never) as Auth;
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const spaceID = Schema.decodeUnknownSync(SpaceIDSchema)(
			c.req.param("spaceID"),
		);
		const body = PushRequest.decodeUnknownSync(await c.req.json());

		// 2: PULL
		const pushEffect = push({
			body,
			db,
			partyKitOrigin: c.env.PARTYKIT_ORIGIN,
		}).pipe(
			Effect.provideService(
				AuthContext,
				AuthContext.of({
					auth,
				}),
			),
			Effect.provideService(
				Cloudflare,
				Cloudflare.of({
					env: c.env,
					headers: c.req.raw.headers,
					request: c.req.raw,
				}),
			),
			Effect.provideService(
				ReplicacheContext,
				ReplicacheContext.of({
					spaceID,
					clientGroupID: body.clientGroupID,
					subspaceIDs: undefined,
				}),
			),
			Effect.scoped,
			Effect.orDie,
		);

		// 3: RUN PROMISE
		await Effect.runPromise(pushEffect);

		return c.json({}, 200);
	})
	.get("/api/hello", (c) => {
		return c.text("hello");
	})
	.route("/api/auth", auth)
	.route("/api/users", users)
	.route("/api/orders", orders)
	.route("/api/carts", carts)
	.route("/api/variants", variants)
	.route("/api/stores", stores)
	.route("/api/products", products)
	.use("*", async (c, next) => {
		if (process.env.NODE_ENV === "production" || import.meta.env.PROD) {
			//@ts-ignore
			const serverBuild = await import("../build/server");
			return remix({
				build: serverBuild,
				mode: "production",
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				async getLoadContext(c) {
					const sessionStorage = getSessionStorage(c);
					const session = getSession(c);
					const env = typedEnv(c.env, BindingsSchema);
					const url = new URL(c.req.url);
					const origin = url.origin;
					const auth = new Authentication({
						serverURL: origin,
					});

					const { user } = await getUserAndSession(auth, session);
					return {
						cloudflare: {
							env,
						},
						sessionStorage,
						session,
						user,
					};
				},
			})(c, next);
		}
		if (!handler) {
			// @ts-expect-error it's not typed
			const build = await import("virtual:remix/server-build");
			const { createRequestHandler } = await import("@remix-run/cloudflare");
			handler = createRequestHandler(build, "development");
		}

		const sessionStorage = getSessionStorage(c);
		const session = getSession(c);

		const url = new URL(c.req.url);
		const origin = url.origin;
		const auth = new Authentication({
			serverURL: origin,
		});

		const { user } = await getUserAndSession(auth, session);

		//@ts-ignore
		const env = BindingsSchema.parse(c.env);
		const remixContext = {
			cloudflare: {
				env,
			},
			sessionStorage,
			session,
			user,
		} as unknown as AppLoadContext;
		return handler(c.req.raw, remixContext);
	});
export default app;
export type AppType = typeof routes;
export const getHonoClient = (serverURL: string) => hc<AppType>(serverURL);
export * from "./auth";
