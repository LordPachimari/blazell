import { schema } from "@blazell/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDB } from "../lib/db";
import type { Auth, Bindings, Env } from "@blazell/validators";

const app = new Hono<{ Bindings: Bindings & Env }>()
	.get("/:name", async (c) => {
		const name = c.req.param("name");
		const db = getDB({ connectionString: c.env.DATABASE_URL });

		const result = await db.query.stores.findFirst({
			where: (stores, { eq }) => eq(stores.name, name),
		});

		if (!result) {
			return c.json(null, 200);
		}

		return c.json(result, 200);
	})
	.post("/update-store/:id", async (c) => {
		const auth = c.get("auth" as never) as Auth;
		if (!auth?.user?.id) {
			return c.text("You are not authorized", 401);
		}
		const db = getDB({ connectionString: c.env.DATABASE_URL });

		const id = c.req.param("id");

		const { name } = z.object({ name: z.string() }).parse(await c.req.json());

		await db
			.update(schema.stores)
			.set({ name })
			.where(eq(schema.stores.id, id));

		return c.json({}, 200);
	});
export default app;
