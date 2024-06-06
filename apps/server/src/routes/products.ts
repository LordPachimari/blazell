import type { Db } from "@blazell/db";
import type { Bindings } from "@blazell/validators";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Bindings }>();
app.get("/:handle", async (c) => {
	const db = c.get("db" as never) as Db;
	const handle = c.req.param("handle");

	const variant = await db.query.variants.findFirst({
		where: (variants, { eq }) => eq(variants.handle, handle),
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
});
export default app;
