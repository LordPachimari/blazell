import { UserService } from "@blazell/api";
import type { Db } from "@blazell/db";
import { Database } from "@blazell/shared";
import { CreateUserSchema, type Bindings } from "@blazell/validators";
import * as Http from "@effect/platform/HttpClient";
import type { getAuth } from "@hono/clerk-auth";
import { Effect } from "effect";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Bindings }>();
app.post("/create-user", async (c) => {
	const db = c.get("db" as never) as Db;
	const props = CreateUserSchema.parse(await c.req.json());

	const result = await Effect.runPromise(
		Effect.gen(function* () {
			const { countryCode, user } = props;

			yield* Effect.tryPromise(() =>
				db.transaction(async (tx) =>
					UserService.createUser({
						countryCode,
						user,
					})
						.pipe(Effect.provideService(Database, Database.of({ manager: tx })))
						.pipe(Effect.orDie),
				),
			).pipe(
				Effect.flatMap((_) => _),
				Effect.retry({ times: 3 }),
				Effect.catchAll((e) =>
					Effect.succeed({
						type: "ERROR",
						message: e.message,
						status: 400 as const,
					}),
				),
				Effect.zipLeft(
					Effect.all([
						Http.request
							.post(`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`)
							.pipe(
								Http.request.jsonBody(["store"]),
								Effect.andThen(Http.client.fetch),
								Effect.retry({ times: 3 }),
								Effect.scoped,
							),
						Http.request
							.post(`${c.env.PARTYKIT_ORIGIN}/parties/main/global`)
							.pipe(
								Http.request.jsonBody(["user"]),
								Effect.andThen(Http.client.fetch),
								Effect.retry({ times: 3 }),
								Effect.scoped,
							),
					]),
				),
			);

			return {
				type: "SUCCESS",
				message: "User created successfully.",
				status: 200 as const,
			};
		}),
	);
	return c.json(result, result.status);
});

app.get("/", async (c) => {
	const db = c.get("db" as never) as Db;
	const auth = c.get("auth" as never) as ReturnType<typeof getAuth>;
	if (!auth?.userId) return c.json(null, 200);
	const cachedUser = await c.env.KV.get(auth.userId);
	if (cachedUser) return c.json(JSON.parse(cachedUser), 200);
	const result = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.authID, auth?.userId),
	});

	if (!result) return c.json(null, 200);

	await c.env.KV.put(auth.userId, JSON.stringify(result), {
		expirationTtl: 60 * 5,
	});

	return c.json(result, 200);
});
app.get(
	"/username/:username",
	// cache({
	// 	cacheName: "blazell-hono-cache",
	// 	cacheControl: "max-age=3600",
	// }),
	async (c) => {
		const db = c.get("db" as never) as Db;
		const username = c.req.param("username");
		const result = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.username, username),
			columns: {
				id: true,
			},
		});
		if (!result) return c.json(null, 200);

		return c.json(result, 200);
	},
);
app.get(
	"/id/:id",
	// cache({
	// 	cacheName: "blazell-hono-cache",
	// 	cacheControl: "max-age=3600",
	// }),
	async (c) => {
		const db = c.get("db" as never) as Db;
		const id = c.req.param("id");
		const result = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.authID, id),
		});
		if (!result) return c.json(null, 200);

		return c.json(result, 200);
	},
);
export default app;
