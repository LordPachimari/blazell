import { Effect } from "effect";
import { isDefined } from "remeda";

import {
	AssignOptionValueToVariantSchema,
	CreatePricesSchema,
	CreateProductOptionSchema,
	CreateProductSchema,
	CreateVariantSchema,
	DeleteImageSchema,
	DeleteInputSchema,
	DeletePricesSchema,
	DeleteProductOptionSchema,
	DeleteProductOptionValueSchema,
	DeleteVariantSchema,
	NotFound,
	UpdateImagesOrderSchema,
	UpdatePriceSchema,
	UpdateProductOptionSchema,
	UpdateProductOptionValuesSchema,
	UpdateProductSchema,
	UpdateVariantSchema,
	UploadImagesSchema,
} from "@pachi/validators";

import { ulid } from "ulidx";
import { z } from "zod";
import { Database, TableMutator } from "../../../..";

import { zod } from "../../../util/zod";
import type { Product, Variant } from "@pachi/validators/server";

const createProduct = zod(CreateProductSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { product } = input;
		yield* _(tableMutator.set(product, "products"));
	}),
);

const deleteProduct = zod(DeleteInputSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id } = input;

		return yield* _(tableMutator.delete(id, "products"));
	}),
);

const updateProduct = zod(UpdateProductSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { updates, id } = input;

		return yield* _(tableMutator.update(id, updates, "products"));
	}),
);

const publishProduct = zod(z.object({ id: z.string() }), (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { manager } = yield* Database;
		const { id } = input;
		const product = yield* _(
			Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
					with: {
						variants: true,
					},
				}),
			).pipe(Effect.orDie),
		);
		if (!product) {
			return yield* _(
				Effect.fail(new NotFound({ message: "Product not found" })),
			);
		}
		const effects =
			product.variants?.map((variant) => {
				return tableMutator.update(
					variant.id,
					{
						handle: `${(product.title ?? "").replace(/ +/g, "_")}-${(
							variant.title ?? ""
						).replace(/ +/g, "_")}-${ulid()}`,
					},
					"variants",
				);
			}) ?? [];

		effects.push(
			tableMutator.update(
				id,
				{
					status: "published",
					handle: `${(product.title ?? "").replace(/ +/g, "_")}-${ulid()}`,
				},
				"products",
			),
		);

		return yield* _(Effect.all(effects, { concurrency: "unbounded" }));
	}),
);

const updateImagesOrder = zod(UpdateImagesOrderSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { manager } = yield* Database;
		const { order, id } = input;
		let entity: Product | Variant | undefined = undefined;
		const isProduct = id.startsWith("product");
		const isVariant = id.startsWith("variant");
		if (isProduct)
			entity = yield* Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
				}),
			).pipe(Effect.orDie);

		if (isVariant)
			entity = yield* Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
				}),
			).pipe(Effect.orDie);

		if (!entity) {
			return yield* _(
				Effect.fail(new NotFound({ message: `Entity not found for ${id}` })),
			);
		}
		const images = structuredClone(entity.images) ?? [];

		for (const image of images) {
			const o = order[image.id];

			if (isDefined.strict(o)) image.order = o;
		}
		images.sort((a, b) => a.order - b.order);

		if (isProduct)
			return yield* _(
				tableMutator.update(id, { images, thumbnail: images[0] }, "products"),
			);
		if (isVariant)
			return yield* _(tableMutator.update(id, { images }, "variants"));
	}),
);

const uploadImages = zod(UploadImagesSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { manager } = yield* Database;
		const { id, images } = input;
		let entity: Product | Variant | undefined = undefined;
		const isProduct = id.startsWith("product");
		const isVariant = id.startsWith("variant");

		if (images.length === 0) {
			return;
		}
		if (isProduct)
			entity = yield* Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
				}),
			).pipe(Effect.orDie);

		if (isVariant)
			entity = yield* Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
				}),
			).pipe(Effect.orDie);

		if (!entity) {
			return yield* _(
				Effect.fail(new NotFound({ message: `Entity not found for ${id}` })),
			);
		}

		const updatedImages = [
			...(entity.images ? entity.images : []),
			...images.map((image) => ({
				id: image.id,
				url: image.url,
				order: image.order,
				name: image.name,
			})),
		];

		return isProduct
			? yield* _(
					tableMutator.update(
						id,
						{
							images: updatedImages,
							thumbnail: updatedImages[0],
						},
						"products",
					),
				)
			: yield* _(
					tableMutator.update(id, { images: updatedImages }, "variants"),
				);
	}),
);
const deleteImage = zod(DeleteImageSchema, (input) => {
	return Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { imageID, id } = input;
		const { manager } = yield* Database;

		let entity: Product | Variant | undefined = undefined;
		const isProduct = id.startsWith("product");
		const isVariant = id.startsWith("variant");
		if (isProduct)
			entity = yield* Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
				}),
			).pipe(Effect.orDie);

		if (isVariant)
			entity = yield* Effect.tryPromise(() =>
				manager.query.products.findFirst({
					where: (products, { eq }) => eq(products.id, id),
				}),
			).pipe(Effect.orDie);

		if (!entity) {
			return yield* _(
				Effect.fail(new NotFound({ message: `Entity not found for ${id}` })),
			);
		}

		const images = entity.images?.filter((image) => image.id !== imageID) ?? [];
		if (isProduct)
			return yield* _(tableMutator.update(id, { images }, "products"));
		if (isVariant)
			return yield* _(tableMutator.update(id, { images }, "variants"));
	});
});

const createProductOption = zod(CreateProductOptionSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);

		const { option } = input;
		const productOptionSet = tableMutator.set(option, "productOptions");
		const productUpdate = tableMutator.update(option.productID, {}, "products");

		return yield* _(
			Effect.all([productOptionSet, productUpdate], {
				concurrency: 2,
			}),
		);
	}),
);

const updateProductOption = zod(UpdateProductOptionSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { optionID, updates, productID } = input;

		const productOptionUpdate = tableMutator.update(
			optionID,
			updates,
			"productOptions",
		);
		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* _(
			Effect.all([productOptionUpdate, productUpdate], {
				concurrency: 2,
			}),
		);
	}),
);

const deleteProductOption = zod(DeleteProductOptionSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { optionID, productID } = input;

		const productOptionDelete = tableMutator.delete(optionID, "productOptions");
		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* _(
			Effect.all([productOptionDelete, productUpdate], {
				concurrency: 2,
			}),
		);
	}),
);

const updateProductOptionValues = zod(
	UpdateProductOptionValuesSchema,
	(input) =>
		Effect.gen(function* (_) {
			const tableMutator = yield* _(TableMutator);
			const { manager } = yield* Database;
			const { optionID, newOptionValues, productID } = input;
			const option = yield* Effect.tryPromise(() =>
				manager.query.productOptions.findFirst({
					where: (productOptions, { eq }) => eq(productOptions.id, optionID),
					with: {
						optionValues: true,
					},
				}),
			);

			if (!option) {
				return yield* _(
					Effect.fail(new NotFound({ message: "Option not found" })),
				);
			}

			const oldValuesKeys = option.optionValues?.map((value) => value.id) ?? [];

			const setOptionValues = tableMutator.set(
				newOptionValues,
				"productOptionValues",
			);

			const updateProduct = tableMutator.update(productID, {}, "products");
			const effects = [setOptionValues, updateProduct];
			oldValuesKeys.length > 0 &&
				effects.push(tableMutator.delete(oldValuesKeys, "productOptionValues"));

			return yield* _(
				Effect.all(effects, {
					concurrency: 3,
				}),
			);
		}),
);

const deleteProductOptionValue = zod(DeleteProductOptionValueSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { optionValueID, productID } = input;

		const productOptionValueDelete = tableMutator.delete(
			optionValueID,
			"productOptionValues",
		);

		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* _(
			Effect.all([productOptionValueDelete, productUpdate], {
				concurrency: 2,
			}),
		);
	}),
);

const createVariant = zod(CreateVariantSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { variant } = input;

		return yield* _(tableMutator.set(variant, "variants"));
	}),
);

const updateVariant = zod(UpdateVariantSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id, updates } = input;

		return yield* _(tableMutator.update(id, updates, "variants"));
	}),
);

const deleteVariant = zod(DeleteVariantSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id } = input;

		yield* _(tableMutator.delete(id, "variants"));
	}),
);

const createPrices = zod(CreatePricesSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { prices, id } = input;

		const isProduct = id.startsWith("product");
		const isVariant = id.startsWith("variant");

		const effects = [tableMutator.set(prices, "prices")];

		if (isProduct) effects.push(tableMutator.update(id, {}, "products"));
		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* _(
			Effect.all(effects, {
				concurrency: 2,
			}),
		);
	}),
);

const updatePrice = zod(UpdatePriceSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { priceID, updates, id } = input;

		const isProduct = id.startsWith("product");
		const isVariant = id.startsWith("variant");

		const effects = [tableMutator.update(priceID, updates, "prices")];

		if (isProduct) effects.push(tableMutator.update(id, {}, "products"));
		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* _(
			Effect.all(effects, {
				concurrency: 2,
			}),
		);
	}),
);

const deletePrices = zod(DeletePricesSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { priceIDs, id } = input;

		const isProduct = id.startsWith("product");
		const isVariant = id.startsWith("variant");

		const effects = [tableMutator.delete(priceIDs, "prices")];
		if (isProduct) effects.push(tableMutator.update(id, {}, "products"));
		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* _(
			Effect.all(effects, {
				concurrency: 2,
			}),
		);
	}),
);

const assignOptionValueToVariant = zod(
	AssignOptionValueToVariantSchema,
	(input) =>
		Effect.gen(function* (_) {
			const tableMutator = yield* _(TableMutator);
			const { optionValueID, variantID, prevOptionValueID } = input;

			const setRelationship = tableMutator.set(
				{ optionValueID, variantID, id: optionValueID },
				"productOptionValuesToVariants",
			);
			const updateVariant = tableMutator.update(variantID, {}, "variants");
			const effects = [setRelationship, updateVariant];

			if (prevOptionValueID)
				effects.push(
					tableMutator.delete(
						prevOptionValueID,
						"productOptionValuesToVariants",
					),
				);

			return yield* _(Effect.all(effects, { concurrency: 3 }));
		}),
);

export {
	assignOptionValueToVariant,
	createProduct,
	createProductOption,
	createVariant,
	createPrices,
	deleteProduct,
	deleteProductOption,
	deleteProductOptionValue,
	deleteVariant,
	deleteImage,
	deletePrices,
	publishProduct,
	updateProduct,
	updateProductOption,
	updateProductOptionValues,
	updateVariant,
	updateImagesOrder,
	updatePrice,
	uploadImages,
};
