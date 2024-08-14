import { Authentication } from "@blazell/auth/src";
import { pull, push, ReplicacheContext, staticPull } from "@blazell/replicache";
import { AuthContext, Cloudflare, Database } from "@blazell/shared";
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
import { Schema } from "@effect/schema";
import type { AppLoadContext, RequestHandler } from "@remix-run/cloudflare";
import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { staticAssets } from "remix-hono/cloudflare";
import { remix } from "remix-hono/handler";
import { getSession, session } from "remix-hono/session";
import { getUserAndSession } from "~/server/auth.server";
import { getDB } from "./lib/db";
import { authMiddleware } from "./lib/middlewares";
import auth from "./routes/auth";
import carts from "./routes/carts";
import orders from "./routes/orders";
import products from "./routes/products";
import stores from "./routes/stores";
import users from "./routes/users";
import variants from "./routes/variants";

const app = new Hono<{ Bindings: Bindings & Env }>();
let handler: RequestHandler | undefined;

app
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
	.use(
		async (c, next) => {
			if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
				return staticAssets()(c, next);
			}
			await next();
		},
		async (c, next) => {
			if (process.env.NODE_ENV !== "development" || import.meta.env.PROD) {
				//@ts-ignore
				const serverBuild = await import("../build/server");
				const session = getSession(c);
				const env = BindingsSchema.parse(c.env);
				const url = new URL(c.req.url);
				const origin = url.origin;
				const auth = Authentication({
					serverURL: origin,
				});

				const { user } = await getUserAndSession(auth, session);

				const remixContext = {
					cloudflare: {
						env,
					},
					session,
					user,
				} as unknown as AppLoadContext;
				return remix({
					//@ts-ignore
					build: serverBuild,
					mode: "production",
					getLoadContext() {
						return remixContext;
					},
				})(c, next);
				// biome-ignore lint/style/noUselessElse: <explanation>
			} else {
				const session = getSession(c);
				const env = BindingsSchema.parse(c.env);
				const url = new URL(c.req.url);
				const origin = url.origin;
				const auth = Authentication({
					serverURL: origin,
				});

				const { user } = await getUserAndSession(auth, session);

				const remixContext = {
					cloudflare: {
						env,
					},
					session,
					user,
				} as unknown as AppLoadContext;
				if (!handler) {
					// @ts-expect-error it's not typed
					const build = await import("virtual:remix/server-build");
					const { createRequestHandler } = await import(
						"@remix-run/cloudflare"
					);
					handler = createRequestHandler(build, "development");
				}
				return handler(c.req.raw, remixContext);
			}
		},
	);
export default app;
