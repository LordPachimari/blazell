import { clerkMiddleware, type getAuth } from "@hono/clerk-auth";
import { Pool } from "@neondatabase/serverless";
import { schema, type Db } from "@blazell/db";
import { ReplicacheContext, pull, push, staticPull } from "@blazell/replicache";
import { Cloudflare, Database } from "@blazell/shared";
import {
	PullRequest,
	PushRequest,
	SpaceIDSchema,
	type Bindings,
	type SpaceRecord,
} from "@blazell/validators";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import users from "./routes/users";
import orders from "./routes/orders";
import carts from "./routes/carts";
import variants from "./routes/variants";
import images from "./routes/images";
import stores from "./routes/stores";
import products from "./routes/products";
import { Schema } from "@effect/schema";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", async (c, next) => {
	const wrapped = cors({
		origin:
			c.env.ENVIRONMENT === "production"
				? "https://blazell.com"
				: c.env.ENVIRONMENT === "development"
					? "https://development.blazell.pages.dev"
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
});
app.use("*", clerkMiddleware());

app.use("*", async (c, next) => {
	const client = new Pool({ connectionString: c.env.DATABASE_URL });
	const db = drizzle(client, { schema });
	// const auth = getAuth(c);
	const fakeAuthId = c.req.header("x-fake-auth-id");

	c.set("db" as never, db);
	c.set("auth" as never, { userId: fakeAuthId });

	return next();
});

app.post("/pull/:spaceID", async (c) => {
	// 1: PARSE INPUT
	const auth = c.get("auth" as never) as ReturnType<typeof getAuth>;
	const db = c.get("db" as never) as Db;
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
		}),
	);
	const ReplicacheContextLive = Layer.succeed(
		ReplicacheContext,
		ReplicacheContext.of({
			spaceID,
			authID: auth?.userId,
			clientGroupID: body.clientGroupID,
			subspaceIDs: subspaceIDs as SpaceRecord[typeof spaceID] | undefined,
		}),
	);

	// 2: PULL
	const pullEffect = pull({
		body,
		db,
	}).pipe(
		Effect.provide(CloudflareLive),
		Effect.provide(ReplicacheContextLive),
		Effect.orDie,
	);

	// 3: RUN PROMISE
	const pullResponse = await Effect.runPromise(pullEffect);

	return c.json(pullResponse, 200);
});

app.post("/static-pull", async (c) => {
	// 1: PARSE INPUT
	const db = c.get("db" as never) as Db;
	const body = PullRequest.decodeUnknownSync(await c.req.json());

	// 2: PULL
	const pullEffect = staticPull({ body }).pipe(
		Effect.provideService(Database, { manager: db }),
		Effect.provideService(
			Cloudflare,
			Cloudflare.of({
				env: c.env,
				headers: c.req.raw.headers,
			}),
		),
		Effect.orDie,
	);

	// 3: RUN PROMISE
	const pullResponse = await Effect.runPromise(pullEffect);

	return c.json(pullResponse, 200);
});

app.post("/push/:spaceID", async (c) => {
	// 1: PARSE INPUT
	const auth = c.get("auth" as never) as ReturnType<typeof getAuth>;
	const db = c.get("db" as never) as Db;
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
			Cloudflare,
			Cloudflare.of({
				env: c.env,
				headers: c.req.raw.headers,
			}),
		),
		Effect.provideService(
			ReplicacheContext,
			ReplicacheContext.of({
				spaceID,
				authID: auth?.userId,
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
});

app.get("/hello", (c) => {
	return c.text("hello");
});

app.route("/users", users);
app.route("/orders", orders);
app.route("/carts", carts);
app.route("/variants", variants);
app.route("/images", images);
app.route("/stores", stores);
app.route("/products", products);
export default app;
