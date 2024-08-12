import { pull, push, ReplicacheContext, staticPull } from "@blazell/replicache";
import { AuthContext, Cloudflare, Database } from "@blazell/shared";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import {
	BindingsSchema,
	PullRequest,
	PushRequest,
	SpaceIDSchema,
	type Auth,
	type Bindings,
	type Env,
	type SpaceRecord,
} from "@blazell/validators";
import devServer from "@hono/vite-dev-server";
import { Schema } from "@effect/schema";
import type { AppLoadContext } from "@remix-run/cloudflare";

import {
	createRequestHandler,
	createWorkersKVSessionStorage,
	type RequestHandler,
} from "@remix-run/cloudflare";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { remix } from "remix-hono/handler";
import { getSession, getSessionStorage, session } from "remix-hono/session";
import { getUserAndSession } from "~/server/auth.server";
import { Authentication, authMiddleware } from "./auth";
import { getDB } from "./lib/db";
import auth from "./routes/auth";
import carts from "./routes/carts";
import orders from "./routes/orders";
import products from "./routes/products";
import stores from "./routes/stores";
import users from "./routes/users";
import variants from "./routes/variants";

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
		authMiddleware,
	)
	.post("/api/pull/:spaceID", async (c) => {
		// 1: PARSE INPUT
		const auth = c.get("auth" as never) as Auth;
		console.log("AUTH FROM PULL", auth);
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
		const auth = c.get("auth" as never) as Auth;
		console.log("auth", auth);
		return c.text("hello");
	})
	.post("/api/test", (c) => {
		const auth = c.get("auth" as never) as Auth;
		console.log("auth from test", auth);
		return c.text("hello");
	})
	.route("/api/auth", auth)
	.route("/api/users", users)
	.route("/api/orders", orders)
	.route("/api/carts", carts)
	.route("/api/variants", variants)
	.route("/api/stores", stores)
	.route("/api/products", products)
	.all("*", async (c) => {
		// @ts-expect-error it's not typed
		const build =
			// c.env.ENVIRONMENT === "local"
			// 	? await import("virtual:remix/server-build")
			await import("@remix-run/dev/server-build");

		const handler = createRequestHandler(build, "development");
		const remixContext = {
			cloudflare: {
				env: c.env,
			},
		} as unknown as AppLoadContext;
		return handler(c.req.raw, remixContext);
	});
// .use("*", async (c) => {
// 	// const serverBuild = await import("../build/server");
// 	const { createRequestHandler } = await import("@remix-run/cloudflare");
// 	handler = createRequestHandler(
// 		// @ts-ignore /* @vite-ignore */
// 		() =>
// 			c.env.ENVIRONMENT === "local"
// 				? import("virtual:remix/server-build")
// 				: import("@remix-run/dev/server-build"),
// 		c.env.ENVIRONMENT === "production" ? "production" : "development",
// 	);

// 	const sessionStorage = getSessionStorage(c);
// 	const session = getSession(c);

// 	const url = new URL(c.req.url);
// 	const origin = url.origin;
// 	const auth = new Authentication({
// 		serverURL: origin,
// 	});

// 	const { user } = await getUserAndSession(auth, session);

// 	//@ts-ignore
// 	const env = BindingsSchema.parse(c.env);
// 	const remixContext = {
// 		cloudflare: {
// 			env,
// 		},
// 		sessionStorage,
// 		session,
// 		user,
// 	} as unknown as AppLoadContext;
// 	return handler(c.req.raw, remixContext);
// });
export default app;
export type AppType = typeof routes;
export const getHonoClient = (serverURL: string) => hc<AppType>(serverURL);
export * from "./auth";
