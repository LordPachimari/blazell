import type { WriteTransaction } from "replicache";

import { generateReplicachePK } from "@blazell/utils";
import type {
	CreateProduct,
	DeleteInput,
	DuplicateProduct,
	InsertVariant,
	ProductDuplicate,
	UpdateProduct,
} from "@blazell/validators";
import type {
	Product,
	ProductOption,
	ProductOptionValue,
	Variant,
} from "@blazell/validators/client";
import { getEntityFromID } from "./util/get-id";
import { Effect } from "effect";
import { satisfies } from "effect/Function";

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
		}),
	);
}
const duplicate = (tx: WriteTransaction, duplicate: ProductDuplicate) =>
	Effect.gen(function* () {
		const product = (yield* Effect.tryPromise(() =>
			tx.get(duplicate.product.replicachePK),
		)) as Product | undefined;

		if (!product) {
			return yield* Effect.fail(`Product ${duplicate.product.id} not found`);
		}

		const optionIDToOptionValue = new Map<string, ProductOptionValue[]>();
		yield* Effect.forEach(duplicate.optionValues, (optionValue) =>
			Effect.sync(() => {
				const optionValues =
					optionIDToOptionValue.get(optionValue.optionID) ?? [];
				optionValues.push(optionValue as ProductOptionValue);
				optionIDToOptionValue.set(optionValue.optionID, optionValues);
			}),
		);

		yield* Effect.all(
			[
				Effect.tryPromise(() =>
					tx.set(duplicate.product.replicachePK, {
						...duplicate.product,
						options: duplicate.options.map(
							(option) =>
								({
									...option,
									optionValues: optionIDToOptionValue.get(option.id) ?? [],
								}) satisfies ProductOption,
						),
						collection: product.collection,
						defaultVariant: duplicate.defaultVariant,
					} as Product),
				),
				Effect.tryPromise(() =>
					tx.set(
						duplicate.defaultVariant.replicachePK,
						duplicate.defaultVariant,
					),
				),
			],
			{
				concurrency: 2,
			},
		);
	});
export {
	createProduct,
	deleteProduct,
	publishProduct,
	updateProduct,
	duplicateProduct,
};
