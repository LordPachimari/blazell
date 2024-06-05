import {
	InvalidValue,
	type CreateVariant,
	type DeleteInput,
	type DuplicateVariant,
	type UpdateVariant,
	type VariantDuplicate,
} from "@blazell/validators";
import type { DeepReadonlyObject, WriteTransaction } from "replicache";
import type { Price, Variant } from "@blazell/validators/client";
import { Effect } from "effect";

export function variantNotFound(id: string) {
	console.info(`Variant ${id} not found`);
	throw new Error(`Variant ${id} not found`);
}
async function createVariant(tx: WriteTransaction, input: CreateVariant) {
	const { variant } = input;

	await tx.set(variant.id, variant);
}

async function updateVariant(tx: WriteTransaction, input: UpdateVariant) {
	const { updates, id } = input;

	const variant = await tx.get<Variant>(id);

	if (!variant) {
		return variantNotFound(id);
	}
	await tx.set(id, {
		...variant,
		...updates,
	});
}

async function deleteVariant(tx: WriteTransaction, input: DeleteInput) {
	const { id } = input;
	await tx.del(id);
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
		const variant = yield* Effect.tryPromise(() =>
			tx.get<Variant>(originalVariantID),
		);

		if (!variant) {
			return yield* Effect.fail(`Product ${originalVariantID} not found`);
		}
		const prices = variant.prices ?? [];
		const priceIDtoNewPriceID = new Map<string, string>();
		yield* Effect.forEach(
			prices,
			(price, index) =>
				Effect.sync(() => {
					priceIDtoNewPriceID.set(price.id, newPriceIDs[index]!);
				}),
			{ concurrency: "unbounded" },
		);

		if (prices.length > newPriceIDs.length) {
			return yield* Effect.fail(
				new InvalidValue({
					message: "Mismatched number of new prices id",
				}),
			);
		}
		const newVariant: DeepReadonlyObject<Variant> = {
			...variant,
			id: newVariantID,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			version: 0,
			handle: null,
			productID: variant.productID,
			prices: prices.map(
				(price) =>
					({
						...price,
						id: priceIDtoNewPriceID.get(price.id)!,
						variantID: newVariantID,
						version: 0,
					}) satisfies Price,
			),
		};
		yield* Effect.tryPromise(() => tx.set(newVariant.id, newVariant));
	});

export { createVariant, updateVariant, deleteVariant, duplicateVariant };
