import { Hono } from "hono";
import type { Db } from "@blazell/db";
import { Effect } from "effect";
import type { Bindings } from "@blazell/validators";

const app = new Hono<{ Bindings: Bindings }>();
app.get("/order", async (c) => {
	const db = c.get("db" as never) as Db;
	const ids = c.req.queries("id");

	if (!ids) return c.json(null, 200);

	const result = await Effect.runPromise(
		Effect.tryPromise(() =>
			db.query.orders.findMany({
				where: (orders, { inArray }) => inArray(orders.id, ids),
				with: {
					items: true,
				},
			}),
		).pipe(Effect.orDie),
	);

	if (!result) return c.json(null, 200);

	return c.json(result, 200);
});
export default app;
