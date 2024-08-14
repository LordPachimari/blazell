import type { Bindings, Env } from "@blazell/validators";
import { Effect } from "effect";
import { Hono } from "hono";
import { getDB } from "../lib/db";

const app = new Hono<{ Bindings: Bindings & Env }>().get(
	"/:handle",
	async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const handle = c.req.param("handle");
		const cachedVariant = await c.env.KV.get(handle);
		if (cachedVariant) return c.json(JSON.parse(cachedVariant), 200);
		const result = await Effect.runPromise(
			Effect.tryPromise(() =>
				db.query.variants.findFirst({
					where: (variants, { eq }) => eq(variants.handle, handle),
				}),
			).pipe(Effect.orDie),
		);

		if (!result) return c.json(null, 200);

		await c.env.KV.put(handle, JSON.stringify(result), {
			expirationTtl: 60 * 60 * 24,
		});

		return c.json(result, 200);
	},
);

export default app;
