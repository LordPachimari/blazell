import {
	InvalidValue,
	type CreateVariant,
	type DeleteInput,
	type DuplicateVariant,
	type UpdateVariant,
	type VariantDuplicate,
} from "@blazell/validators";
import type { WriteTransaction } from "replicache";
import { getEntityFromID } from "./util/get-id";
import type { Price, Variant } from "@blazell/validators/client";
import { Effect } from "effect";
import { generateReplicachePK } from "@blazell/utils";

export function variantNotFound(id: string) {
	console.info(`Variant ${id} not found`);
	throw new Error(`Variant ${id} not found`);
}
async function createVariant(tx: WriteTransaction, input: CreateVariant) {
	const { variant } = input;

	await tx.set(variant.replicachePK, variant);
}

async function updateVariant(tx: WriteTransaction, input: UpdateVariant) {
	const { updates, id } = input;

	const variant = (await getEntityFromID(tx, id)) as Variant | undefined;

	if (!variant) {
		return variantNotFound(id);
	}
	await tx.set(variant.replicachePK, {
		...variant,
		...updates,
	});
}

async function deleteVariant(tx: WriteTransaction, input: DeleteInput) {
	const { id } = input;
	const variant = (await getEntityFromID(tx, id)) as Variant | undefined;
	variant && (await tx.del(variant.replicachePK));
}
async function duplicateVariant(tx: WriteTransaction, input: DuplicateVariant) {
	const { duplicates } = input;
	await Effect.runPromise(
		Effect.forEach(duplicates, (_duplicate) => duplicate(tx, _duplicate), {
			concurrency: "unbounded",
		}).pipe(Effect.orDie),
	);
}
const duplicate = (tx: WriteTransaction, duplicate: VariantDuplicate) =>
	Effect.gen(function* () {
		const { originalVariantID, newVariantID, newPriceIDs } = duplicate;
		const variant = (yield* Effect.tryPromise(() =>
			getEntityFromID(tx, originalVariantID),
		)) as Variant | undefined;

		if (!variant) {
			return yield* Effect.fail(`Product ${originalVariantID} not found`);
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

		if (variant.prices.length > newPriceIDs.length) {
			return yield* Effect.fail(
				new InvalidValue({
					message: "Mismatched number of new prices id",
				}),
			);
		}
		const newDefaultVariant: Variant = {
			...variant,
			id: newVariantID,
			replicachePK: generateReplicachePK({
				prefix: "default_var",
				id: newVariantID,
				filterID: variant.productID,
			}),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: 0,
			handle: null,
			productID: variant.productID,
			prices: variant.prices.map(
				(price) =>
					({
						...price,
						id: priceIDtoNewPriceID.get(price.id)!,
						replicachePK: null,
						variantID: newVariantID,
						version: 0,
					}) satisfies Price,
			),
		};
		yield* Effect.tryPromise(() =>
			tx.set(newDefaultVariant.replicachePK, newDefaultVariant),
		);
	});

export { createVariant, updateVariant, deleteVariant, duplicateVariant };
