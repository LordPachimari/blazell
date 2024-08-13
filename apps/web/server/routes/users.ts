import { UserService } from "@blazell/api";
import { AuthContext, Database } from "@blazell/shared";
import type { Auth, Bindings, Env } from "@blazell/validators";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { zValidator } from "@hono/zod-validator";
import { Console, Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";
import { getDB } from "../lib/db";
const app = new Hono<{ Bindings: Bindings & Env }>()
	.get("/", async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const auth = c.get("auth" as never) as Auth;
		console.log("auth from users", auth);
		const userID = auth.user?.id;
		if (!userID) return c.json(null, 200);
		const cachedUser = await c.env.KV.get(userID);
		if (cachedUser) return c.json(JSON.parse(cachedUser), 200);
		const result = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userID),
		});

		if (!result) return c.json(null, 200);

		await c.env.KV.put(userID, JSON.stringify(result), {
			expirationTtl: 60 * 5,
		});

		return c.json(result, 200);
	})
	.get(
		"/username/:username",
		// cache({
		// 	cacheName: "blazell-hono-cache",
		// 	cacheControl: "max-age=3600",
		// }),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const username = c.req.param("username");
			const result = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username),
				columns: {
					username: true,
				},
			});
			if (!result) return c.json(null, 200);

			return c.json(result, 200);
		},
	)
	.get(
		"/email/:email",
		// cache({
		// 	cacheName: "blazell-hono-cache",
		// 	cacheControl: "max-age=3600",
		// }),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const email = c.req.param("email");
			const result = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
				columns: {
					id: true,
				},
			});
			if (!result) return c.json(null, 200);

			return c.json(result, 200);
		},
	)
	.get(
		"/id/:id",
		// cache({
		// 	cacheName: "blazell-hono-cache",
		// 	cacheControl: "max-age=3600",
		// }),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });
			const id = c.req.param("id");
			const result = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, id),
			});
			if (!result) return c.json(null, 200);

			return c.json(result, 200);
		},
	)
	.post(
		"/onboard",
		zValidator(
			"json",
			z.object({
				username: z.string(),
				countryCode: z.string(),
			}),
		),
		async (c) => {
			const db = getDB({ connectionString: c.env.DATABASE_URL });

			const auth = c.get("auth" as never) as Auth;
			const { username, countryCode } = c.req.valid("json");
			if (!auth.user) {
				return c.json({ status: "error", honoStatus: 401 as const }, 401);
			}
			const result = await Effect.runPromise(
				Effect.gen(function* () {
					yield* Effect.tryPromise(() =>
						db.transaction(async (tx) =>
							UserService.onboardUser({
								countryCode,
								username,
							})
								.pipe(
									Effect.provideService(Database, Database.of({ manager: tx })),
									Effect.provideService(AuthContext, AuthContext.of({ auth })),
								)
								.pipe(Effect.orDie),
						),
					).pipe(
						Effect.flatMap((_) => _),
						Effect.retry({ times: 3 }),
						Effect.catchAll((e) =>
							Effect.gen(function* () {
								yield* Console.log(e.message);
								yield* Effect.succeed({
									status: "error",
									honoStatus: 400 as const,
								});
							}),
						),
						Effect.zipLeft(
							Effect.all([
								HttpClientRequest.post(
									`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`,
								).pipe(
									HttpClientRequest.jsonBody(["store"]),
									Effect.andThen(HttpClient.fetch),
									Effect.retry({ times: 3 }),
									Effect.scoped,
								),
								HttpClientRequest.post(
									`${c.env.PARTYKIT_ORIGIN}/parties/main/global`,
								).pipe(
									HttpClientRequest.jsonBody(["user"]),
									Effect.andThen(HttpClient.fetch),
									Effect.retry({ times: 3 }),
									Effect.scoped,
								),
							]),
						),
					);
					return {
						status: "success",
						honoStatus: 200 as const,
					};
				}),
			);
			return c.json(result, result.honoStatus);
		},
	);

export default app;
