import { Effect } from "effect";

import {
	CreateProductSchema,
	DuplicateProductSchema,
	NeonDatabaseError,
	ProductDuplicateSchema,
	UpdateProductSchema,
	type InsertVariant,
} from "@blazell/validators";

import { Database } from "@blazell/shared";
import { generateReplicachePK, toUrlFriendly } from "@blazell/utils";
import { ulid } from "ulidx";
import { z } from "zod";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

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
			quantity: 1,
		};
		yield* tableMutator.set(product, "products");
		yield* tableMutator.set(defaultVariant, "variants");
	}),
);

const deleteProduct = zod(
	z.object({
		keys: z.array(z.string()),
	}),
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { keys } = input;

			return yield* tableMutator.delete(keys, "products");
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
					variants: {
						with: {
							optionValues: {
								with: {
									optionValue: true,
								},
							},
						},
					},
					defaultVariant: true,
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
						handle: `${toUrlFriendly(
							product.defaultVariant.title ?? "",
						)}-${variant.optionValues
							.map((val) => val.optionValue.value)
							.join("-")}-${ulid()}`,
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
const duplicateProduct = zod(DuplicateProductSchema, (input) =>
	Effect.gen(function* () {
		const { duplicates } = input;
		yield* Effect.forEach(
			duplicates,
			(_duplicate) => duplicate({ duplicate: _duplicate }),
			{
				concurrency: "unbounded",
			},
		);
	}),
);

const duplicate = zod(
	z.object({
		duplicate: ProductDuplicateSchema,
	}),
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { duplicate } = input;

			yield* tableMutator.set(duplicate.product, "products");

			yield* tableMutator.set(duplicate.defaultVariant, "variants");

			yield* Effect.all(
				[
					Effect.forEach(
						duplicate.prices,
						(price) => {
							return tableMutator.set(price, "prices");
						},
						{ concurrency: "unbounded" },
					),
					Effect.forEach(
						duplicate.options,
						(option) => {
							return tableMutator.set(option, "productOptions");
						},
						{ concurrency: "unbounded" },
					),
				],
				{
					concurrency: 2,
				},
			);

			yield* Effect.forEach(
				duplicate.optionValues,
				(optionValue) => {
					return tableMutator.set(optionValue, "productOptionValues");
				},
				{ concurrency: "unbounded" },
			);
		}),
);

export {
	createProduct,
	deleteProduct,
	duplicateProduct,
	publishProduct,
	updateProduct,
};
