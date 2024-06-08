import type { getAuth } from "@hono/clerk-auth";
import { schema, type Db } from "@blazell/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings } from "hono/types";
import { z } from "zod";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:name", async (c) => {
	const name = c.req.param("name");
	const db = c.get("db" as never) as Db;

	const result = await db.query.stores.findFirst({
		where: (stores, { eq }) => eq(stores.name, name),
	});

	if (!result) {
		return c.json(null, 200);
	}

	return c.json(result, 200);
});

app.post("/update-store/:id", async (c) => {
	const auth = c.get("auth" as never) as ReturnType<typeof getAuth>;
	if (!auth?.userId) {
		return c.text("You are not authorized", 401);
	}
	const db = c.get("db" as never) as Db;

	const id = c.req.param("id");

	const { name } = z.object({ name: z.string() }).parse(await c.req.json());

	await db.update(schema.stores).set({ name }).where(eq(schema.stores.id, id));

	return c.json({}, 200);
});
export default app;
