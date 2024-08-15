import { Effect } from "effect";

import {
	CreateProductSchema,
	DuplicateProductSchema,
	InvalidValue,
	NeonDatabaseError,
	NotFound,
	ProductDuplicateSchema,
	UpdateProductSchema,
	type InsertVariant,
} from "@blazell/validators";

import { schema } from "@blazell/db";
import { Database } from "@blazell/shared";
import { toUrlFriendly } from "@blazell/utils";
import type {
	Price,
	Product,
	ProductOption,
	ProductOptionValue,
	Variant,
} from "@blazell/validators/server";
import { and, eq, isNotNull } from "drizzle-orm";
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
		const { manager } = yield* Database;
		const { updates, id, storeID } = input;
		yield* Effect.all(
			[
				tableMutator.update(id, updates, "products"),
				storeID
					? tableMutator.update(storeID, {}, "stores")
					: Effect.succeed({}),
			],
			{ concurrency: 2 },
		);
		if (updates.status) {
			/* delete all the existing line items in the cart so that the user doesn't accidentally buy a product with a modified price */
			yield* Effect.tryPromise(() =>
				manager
					.delete(schema.lineItems)
					.where(
						and(
							eq(schema.lineItems.productID, id),
							isNotNull(schema.lineItems.cartID),
						),
					),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
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
const copyProduct = zod(DuplicateProductSchema, (input) =>
	Effect.gen(function* () {
		const { duplicates } = input;
		yield* Effect.forEach(duplicates, (_duplicate) => duplicate(_duplicate), {
			concurrency: "unbounded",
		});
	}),
);

//TODO : add collection
const duplicate = zod(ProductDuplicateSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const {
			newDefaultVariantID,
			newOptionIDs,
			newOptionValueIDs,
			newPriceIDs,
			newProductID,
			originalProductID,
		} = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, originalProductID),
				with: {
					defaultVariant: {
						with: {
							prices: true,
						},
					},
					options: {
						with: {
							optionValues: true,
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
		if (!product) {
			return yield* Effect.fail(
				new NotFound({
					message: `Product not found: id ${originalProductID}`,
				}),
			);
		}
		const defaultVariant = product.defaultVariant;
		const prices = defaultVariant.prices;
		const options = product.options;
		const optionValues = product.options.flatMap(
			(option) => option.optionValues,
		);
		const optionIDtoNewOptionID = new Map<string, string>();
		const optionValueIDtoNewOptionValueID = new Map<string, string>();
		const priceIDtoNewPriceID = new Map<string, string>();
		yield* Effect.all(
			[
				Effect.forEach(
					options,
					(option, index) =>
						Effect.sync(() => {
							optionIDtoNewOptionID.set(option.id, newOptionIDs[index]!);
						}),
					{ concurrency: "unbounded" },
				),
				Effect.forEach(
					optionValues,
					(optionValue, index) =>
						Effect.sync(() => {
							optionValueIDtoNewOptionValueID.set(
								optionValue.id,
								newOptionValueIDs[index]!,
							);
						}),
					{ concurrency: "unbounded" },
				),

				Effect.forEach(
					prices,
					(price, index) =>
						Effect.sync(() => {
							priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
						}),
					{ concurrency: "unbounded" },
				),
			],
			{ concurrency: 3 },
		);
		if (
			prices.length > newPriceIDs.length ||
			options.length > newOptionIDs.length ||
			optionValues.length > newOptionValueIDs.length
		) {
			return yield* Effect.fail(
				new InvalidValue({
					message:
						"Mismatched number of new prices id, options id, or option values id.",
				}),
			);
		}

		yield* tableMutator.set(
			{
				id: newProductID,
				collectionID: product.collectionID,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				defaultVariantID: newDefaultVariantID,
				metadata: product.metadata,
				score: 0,
				status: "draft",
				storeID: product.storeID,
				version: 0,
				updatedBy: null,
				type: "digital",
			} satisfies Product,
			"products",
		);

		yield* tableMutator.set(
			{
				id: newDefaultVariantID,
				productID: newProductID,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				version: 0,
				allowBackorder: defaultVariant.allowBackorder,
				quantity: defaultVariant.quantity,
				barcode: defaultVariant.barcode,
				images: defaultVariant.images,
				metadata: defaultVariant.metadata,
				handle: null,
				sku: defaultVariant.sku,
				title: defaultVariant.title,
				thumbnail: defaultVariant.thumbnail,
				updatedBy: null,
				weight: defaultVariant.weight,
				weightUnit: defaultVariant.weightUnit,
				description: defaultVariant.description,
				height: defaultVariant.height,
				length: defaultVariant.length,
				material: defaultVariant.material,
				originCountry: defaultVariant.originCountry,
				width: defaultVariant.width,
				discountable: defaultVariant.discountable,
			} satisfies Variant,
			"variants",
		);

		yield* Effect.all(
			[
				Effect.forEach(
					prices,
					(price) => {
						return tableMutator.set(
							{
								...price,
								id: priceIDtoNewPriceID.get(price.id)!,
								variantID: newDefaultVariantID,
								version: 0,
							} satisfies Price,
							"prices",
						);
					},
					{ concurrency: "unbounded" },
				),
				Effect.forEach(
					options,
					(option) =>
						Effect.gen(function* () {
							return yield* tableMutator.set(
								{
									id: optionIDtoNewOptionID.get(option.id)!,
									name: option.name,
									productID: newProductID,
									version: 0,
								} satisfies ProductOption,
								"productOptions",
							);
						}),
					{ concurrency: "unbounded" },
				),
			],
			{
				concurrency: 2,
			},
		);

		yield* Effect.forEach(
			optionValues,
			(optionValue) => {
				return tableMutator.set(
					{
						...optionValue,
						id: optionValueIDtoNewOptionValueID.get(optionValue.id)!,
						optionID: optionIDtoNewOptionID.get(optionValue.optionID)!,
						version: 0,
					} satisfies ProductOptionValue,
					"productOptionValues",
				);
			},
			{ concurrency: "unbounded" },
		);
	}),
);

export {
	copyProduct,
	createProduct,
	deleteProduct,
	publishProduct,
	updateProduct,
};
