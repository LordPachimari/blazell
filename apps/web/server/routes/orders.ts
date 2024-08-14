import type { Bindings, Env } from "@blazell/validators";
import { Effect } from "effect";
import { Hono } from "hono";
import { getDB } from "../lib/db";

const app = new Hono<{ Bindings: Bindings & Env }>().get(
	"/order",
	async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const ids = c.req.queries("id");

		if (!ids) return c.json(null, 200);

		const result = await Effect.runPromise(
			Effect.tryPromise(() =>
				db.query.orders.findMany({
					where: (orders, { inArray }) => inArray(orders.id, ids),
					with: {
						items: {
							with: {
								variant: {
									with: {
										optionValues: {
											with: {
												optionValue: {
													with: {
														option: true,
													},
												},
											},
										},
										prices: true,
									},
								},
								product: true,
							},
						},
						shippingAddress: true,
						billingAddress: true,
						store: {
							columns: {
								id: true,
								storeImage: true,
								name: true,
							},
						},
					},
				}),
			).pipe(Effect.orDie),
		);

		if (!result) return c.json(null, 200);

		return c.json(result, 200);
	},
);
export default app;
