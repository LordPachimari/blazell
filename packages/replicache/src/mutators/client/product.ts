import type { WriteTransaction } from "replicache";

import { generateReplicachePK } from "@blazell/utils";
import {
	InvalidValue,
	NotFound,
	type CreateProduct,
	type DuplicateProduct,
	type InsertVariant,
	type ProductDuplicate,
	type UpdateProduct,
} from "@blazell/validators";
import type { Price, Product, Variant } from "@blazell/validators/client";
import { Effect } from "effect";
import { getEntityFromID } from "./util/get-id";

export function productNotFound(id: string) {
	console.info(`Product ${id} not found`);
	throw new Error(`Product ${id} not found`);
}

async function createProduct(tx: WriteTransaction, input: CreateProduct) {
	const { product } = input;
	const defaultVariant: InsertVariant = {
		id: product.defaultVariantID,
		replicachePK: generateReplicachePK({
			prefix: "default_var",
			filterID: product.id,
			id: product.defaultVariantID,
		}),
		quantity: 1,
		productID: product.id,
	};

	await tx.set(product.replicachePK, { ...product, defaultVariant });
	await tx.set(defaultVariant.replicachePK, defaultVariant);
}

async function deleteProduct(tx: WriteTransaction, input: { keys: string[] }) {
	const { keys } = input;
	console.log("keys", keys);
	for (const key of keys) {
		const product = (await getEntityFromID(tx, key)) as Product | undefined;
		console.log("product to delete", product);
		product && (await tx.del(product.replicachePK));
	}
}

async function updateProduct(tx: WriteTransaction, input: UpdateProduct) {
	const { updates, id } = input;
	const product = (await getEntityFromID(tx, id)) as Product | undefined;

	if (!product) {
		return productNotFound(id);
	}
	await tx.set(product.replicachePK, {
		...product,
		...updates,
	});
}

async function publishProduct(tx: WriteTransaction, input: { id: string }) {
	const { id } = input;
	const product = (await getEntityFromID(tx, id)) as Product | undefined;

	if (!product) {
		return productNotFound(id);
	}
	await tx.set(product.replicachePK, {
		...product,
		status: "published",
	});
}
async function duplicateProduct(tx: WriteTransaction, input: DuplicateProduct) {
	const { duplicates } = input;
	await Effect.runPromise(
		Effect.forEach(duplicates, (_duplicate) => duplicate(tx, _duplicate), {
			concurrency: "unbounded",
		}).pipe(Effect.orDie),
	);
}
const duplicate = (tx: WriteTransaction, duplicate: ProductDuplicate) =>
	Effect.gen(function* () {
		const {
			newDefaultVariantID,
			newOptionIDs,
			newOptionValueIDs,
			newPriceIDs,
			newProductID,
			originalProductID,
		} = duplicate;
		const product = (yield* Effect.tryPromise(() =>
			getEntityFromID(tx, originalProductID),
		)) as Product | undefined;

		if (!product) {
			return yield* Effect.fail(
				new NotFound({ message: `Product ${originalProductID} not found` }),
			);
		}
		const defaultVariant = (yield* Effect.tryPromise(() =>
			getEntityFromID(tx, product.defaultVariantID),
		)) as Variant | undefined;

		if (!defaultVariant) {
			return yield* Effect.fail(
				new NotFound({
					message: `Default variant ${product.defaultVariantID} not found`,
				}),
			);
		}
		const prices = defaultVariant.prices;
		const options = product.options ?? [];
		const optionValues = options.flatMap((option) => option.optionValues ?? []);
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
				Effect.forEach(prices, (price, index) =>
					Effect.sync(() => {
						priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
					}),
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
		const newDefaultVariant: Variant = {
			...defaultVariant,
			id: newDefaultVariantID,
			replicachePK: generateReplicachePK({
				prefix: "default_var",
				id: newDefaultVariantID,
				filterID: newProductID,
			}),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: 0,
			handle: null,
			productID: newProductID,
			prices: prices.map(
				(price) =>
					({
						...price,
						id: priceIDtoNewPriceID.get(price.id)!,
						replicachePK: null,
						variantID: newDefaultVariantID,
						version: 0,
					}) satisfies Price,
			),
			optionValues: (defaultVariant.optionValues ?? []).map((value, index) => ({
				optionValue: {
					id: optionValueIDtoNewOptionValueID.get(value.optionValue.id)!,
					replicachePK: null,
					option: {
						...value.optionValue.option,
						id: optionIDtoNewOptionID.get(value.optionValue.optionID)!,
						productID: newProductID,
						version: 0,
					},
					optionID: optionIDtoNewOptionID.get(value.optionValue.optionID)!,
					version: 0,
					value: value.optionValue.value,
				},
			})),
		};
		//TODO : add collection
		yield* Effect.tryPromise(() =>
			tx.set(newProductID, {
				...product,
				id: newProductID,
				replicachePK: generateReplicachePK({
					prefix: "product",
					id: newProductID,
				}),

				defaultVariantID: newDefaultVariantID,
				defaultVariant: newDefaultVariant,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				variants: [],
				metadata: null,
				options: options.map((option) => ({
					...option,
					id: optionIDtoNewOptionID.get(option.id)!,
					replicachePK: null,
					optionValues: option.optionValues
						? option.optionValues?.map((value) => ({
								...value,
								id: optionValueIDtoNewOptionValueID.get(value.id)!,
								optionID: optionIDtoNewOptionID.get(value.optionID)!,
								version: 0,
							}))
						: [],
				})),
				version: 0,
				status: "draft",
			} satisfies Product),
		);
	});
export {
	createProduct,
	deleteProduct,
	duplicateProduct,
	publishProduct,
	updateProduct,
};
