import type { Bindings, Env } from "@blazell/validators";
import { Hono } from "hono";
import { getDB } from "../lib/db";

const app = new Hono<{ Bindings: Bindings & Env }>().get(
	"/:handle",
	async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const handle = c.req.param("handle");

		const variant = await db.query.variants.findFirst({
			where: (variants, { eq }) => eq(variants.handle, handle),
			with: {
				prices: true,
				optionValues: {
					with: {
						optionValue: true,
					},
				},
			},
		});

		if (!variant) {
			return c.json(null, 200);
		}
		const product = await db.query.products.findFirst({
			where: (products, { eq }) => eq(products.id, variant.productID),
			with: {
				options: {
					with: {
						optionValues: true,
					},
				},
			},
		});

		return c.json(
			{
				...product,
				defaultVariant: variant,
			},
			200,
		);
	},
);
export default app;
