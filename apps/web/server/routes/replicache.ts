import { pull, push, ReplicacheContext, staticPull } from "@blazell/replicache";
import { AuthContext, Cloudflare, Database } from "@blazell/shared";
import {
	PullRequest,
	PushRequest,
	SpaceIDSchema,
	type Bindings,
	type Env,
	type SpaceRecord,
} from "@blazell/validators";
import { Schema } from "@effect/schema";
import { Effect, Layer } from "effect";
import { Hono } from "hono";
import { getAuthUser } from "server/lib/get-user";
import { getDB } from "../lib/db";

const app = new Hono<{ Bindings: Bindings & Env }>();

app
	.post("/pull/:spaceID", async (c) => {
		// 1: PARSE INPUT
		const authUser = await getAuthUser(c);
		console.log("USER FROM PULL", authUser);
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
				env: c.env,
				request: c.req.raw,
				bindings: {
					KV: c.env.KV,
				},
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
				authUser,
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
	.post("/static-pull", async (c) => {
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
					request: c.req.raw,
					bindings: {
						KV: c.env.KV,
					},
				}),
			),
			Effect.orDie,
		);

		// 3: RUN PROMISE
		const pullResponse = await Effect.runPromise(pullEffect);

		return c.json(pullResponse, 200);
	})
	.post("/push/:spaceID", async (c) => {
		const authUser = await getAuthUser(c);

		// 1: PARSE INPUT
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
					authUser,
				}),
			),
			Effect.provideService(
				Cloudflare,
				Cloudflare.of({
					env: c.env,
					request: c.req.raw,
					bindings: {
						KV: c.env.KV,
					},
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
	});
export default app;
