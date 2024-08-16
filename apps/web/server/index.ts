import {
	EnvSchema,
	type Auth,
	type Bindings,
	type Env,
} from "@blazell/validators";
import { trpcServer } from "@hono/trpc-server";
import type { AppLoadContext, RequestHandler } from "@remix-run/cloudflare";
import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { staticAssets } from "remix-hono/cloudflare";
import { remix } from "remix-hono/handler";
import { getSession, session } from "remix-hono/session";
import { getAuthUser } from "./lib/get-user";
import images from "./routes/images";
import stores from "./routes/stores";
import replicache from "./routes/replicache";
import { appRouter, type TRPCContext } from "./trpc";

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
	)
	.post("/api/test", (c) => {
		const auth = c.get("auth" as never) as Auth;
		console.log("auth from test", auth);
		return c.text("hello");
	})
	.route("/api/replicache", replicache)
	.route("/api/images", images)
	.route("/api/stores", stores)
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
				const env = EnvSchema.parse(c.env);
				const authUser = await getAuthUser(c);

				const remixContext = {
					cloudflare: {
						env,
						bindings: c.env.KV,
					},
					session,
					authUser,
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
				const env = EnvSchema.parse(c.env);

				const authUser = await getAuthUser(c);

				const remixContext = {
					cloudflare: {
						env,
						bindings: c.env.KV,
					},
					session,
					authUser,
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
	)
	.use(
		"/trpc/*",
		trpcServer({
			router: appRouter,
			createContext: async (_opts, c) => {
				const authUser = await getAuthUser(c);
				return {
					env: c.env,
					request: c.req.raw,
					authUser,
					bindings: {
						KV: c.env.KV,
					},
				} satisfies TRPCContext;
			},
		}),
	);
export default app;
