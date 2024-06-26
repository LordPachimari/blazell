import { LiveInputError, LiveInputResponse } from "@blazell/validators";
import * as Http from "@effect/platform/HttpClient";
import type { getAuth } from "@hono/clerk-auth";
import { Console, Effect, pipe } from "effect";
import { Hono } from "hono";
import type { Bindings } from "hono/types";

const app = new Hono<{ Bindings: Bindings }>();
app.get("/live-inputs", async (c) => {
	const auth = c.get("auth" as never) as ReturnType<typeof getAuth>;
	if (!auth?.userId) {
		return c.text("You are not authorized", 401);
	}

	const { result } = await Effect.runPromise(
		pipe(
			Http.request
				.post(
					`https://api.cloudflare.com/client/v4/accounts/${c.env.ACCOUNT_ID}/stream/live_inputs`,
				)
				.pipe(
					Http.request.setHeaders({
						Authorization: `Bearer ${c.env.IMAGE_API_TOKEN}`,
					}),
					Http.client.fetch,
					Effect.flatMap(Http.response.schemaBodyJson(LiveInputResponse)),
					Effect.scoped,
					Effect.orDie,
				),
			Effect.flatMap((response) =>
				Effect.gen(function* () {
					if (response.errors.length > 0) {
						yield* Console.log("Error getting inputs", response.errors);
						yield* new LiveInputError({
							message: "Error uploading image",
						});
					}
					return response;
				}),
			),
			Effect.orDie,
		),
	);
	return c.json(result, 200);
});

export default app;
