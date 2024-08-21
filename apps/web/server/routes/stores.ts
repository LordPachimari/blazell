import type { Bindings, Env } from "@blazell/validators";
import { Hono } from "hono";
import { getDB } from "../lib/db";

const app = new Hono<{ Bindings: Bindings & Env }>().get(
	"/name/:name",
	async (c) => {
		const name = c.req.param("name");
		const db = getDB({ connectionString: c.env.DATABASE_URL });

		const result = await db.query.stores.findFirst({
			where: (stores, { eq }) => eq(stores.name, name),
			with: {
				owner: true,
				products: true,
			},
		});

		if (!result) {
			return c.json(null, 200);
		}

		return c.json(result, 200);
	},
);
export default app;
