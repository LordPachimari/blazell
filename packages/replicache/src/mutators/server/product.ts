import { Effect } from "effect";

import {
	CreateProductSchema,
	DeleteInputSchema,
	NeonDatabaseError,
	UpdateProductSchema,
	type InsertVariant,
} from "@blazell/validators";

import { ulid } from "ulidx";
import { z } from "zod";
import { Database } from "@blazell/shared";
import { generateReplicachePK } from "@blazell/utils";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const createProduct = zod(CreateProductSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { product } = input;
		const defaultVariant: InsertVariant = {
			id: product.defaultVariantID,
			replicachePK: generateReplicachePK({
				prefix: "default_var",
				filterID: product.id,
				id: product.defaultVariantID,
			}),
			productID: product.id,
		};
		yield* tableMutator.set(product, "products");
		yield* tableMutator.set(defaultVariant, "variants");
	}),
);

const deleteProduct = zod(DeleteInputSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id } = input;

		return yield* tableMutator.delete(id, "products");
	}),
);

const updateProduct = zod(UpdateProductSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { updates, id } = input;
		return yield* tableMutator.update(id, updates, "products");
	}),
);

const publishProduct = zod(z.object({ id: z.string() }), (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { id } = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, id),
				with: {
					variants: true,
				},
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (!product) {
			return yield* Effect.succeed({});
		}
		const effects =
			product.variants?.map((variant) => {
				return tableMutator.update(
					variant.id,
					{
						handle: `${variant.title ?? ""}-${ulid()}`,
					},
					"variants",
				);
			}) ?? [];

		effects.push(
			tableMutator.update(
				id,
				{
					status: "published",
				},
				"products",
			),
		);

		return yield* Effect.all(effects, { concurrency: "unbounded" });
	}),
);

export { createProduct, deleteProduct, publishProduct, updateProduct };
