import { Database } from "@blazell/shared";
import { generateReplicachePK } from "@blazell/utils";
import {
	CreateVariantSchema,
	DeleteInputSchema,
	DuplicateVariantSchema,
	NeonDatabaseError,
	NotFound,
	UpdateVariantSchema,
	VariantDuplicateSchema,
} from "@blazell/validators";
import type { Price, Variant } from "@blazell/validators/server";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";
import { createPrices } from "./price";

const createVariant = zod(CreateVariantSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { variant, prices } = input;

		yield* tableMutator.set(variant, "variants");
		prices && (yield* createPrices({ prices, id: variant.id }));
	}),
);

const deleteVariant = zod(DeleteInputSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id } = input;

		yield* tableMutator.delete(id, "variants");
	}),
);

const updateVariant = zod(UpdateVariantSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id, updates } = input;

		yield* tableMutator.update(id, updates, "variants");
	}),
);
const duplicateVariant = zod(DuplicateVariantSchema, (input) =>
	Effect.gen(function* () {
		const { duplicates } = input;
		yield* Effect.forEach(duplicates, (_duplicate) => duplicate(_duplicate), {
			concurrency: "unbounded",
		});
	}),
);
const duplicate = zod(VariantDuplicateSchema, (input) =>
	Effect.gen(function* () {
		const { newVariantID, newPriceIDs, originalVariantID } = input;
		const { manager } = yield* Database;
		const tableMutator = yield* TableMutator;
		const variant = yield* Effect.tryPromise(() =>
			manager.query.variants.findFirst({
				where: (variants, { eq }) => eq(variants.id, originalVariantID),
				with: {
					prices: true,
					optionValues: {
						with: {
							optionValue: true,
						},
					},
				},
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		if (!variant) {
			return yield* Effect.fail(
				new NotFound({
					message: `variant not found: id ${originalVariantID}`,
				}),
			);
		}
		const priceIDtoNewPriceID = new Map<string, string>();

		yield* Effect.forEach(
			variant.prices,
			(price, index) =>
				Effect.sync(() => {
					priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
				}),
			{ concurrency: "unbounded" },
		);
		yield* tableMutator.set(
			{
				id: newVariantID,
				productID: variant.productID,
				replicachePK: generateReplicachePK({
					prefix: "variant",
					filterID: variant.productID,
					id: newVariantID,
				}),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				version: 0,
				allowBackorder: variant.allowBackorder,
				quantity: variant.quantity,
				barcode: variant.barcode,
				images: variant.images,
				metadata: variant.metadata,
				handle: null,
				sku: variant.sku,
				title: variant.title,
				thumbnail: variant.thumbnail,
				updatedBy: null,
				weight: variant.weight,
				weightUnit: variant.weightUnit,
			} satisfies Variant,
			"variants",
		);
		yield* Effect.all(
			[
				Effect.forEach(
					variant.prices,
					(price, index) => {
						return tableMutator.set(
							{
								...price,
								id: newPriceIDs[index]!,
								variantID: newVariantID,
								version: 0,
							} satisfies Price,
							"prices",
						);
					},
					{ concurrency: "unbounded" },
				),
				Effect.forEach(
					variant.optionValues,
					(value) =>
						tableMutator.set(
							{
								optionValueID: value.optionValue.id,
								variantID: newVariantID,
								id: "whatever",
							},
							"productOptionValuesToVariants",
						),
					{ concurrency: "unbounded" },
				),
			],
			{
				concurrency: 2,
			},
		);
	}),
);
export { createVariant, deleteVariant, updateVariant, duplicateVariant };
