import type {
	CreateVariant,
	DeleteInput,
	UpdateVariant,
} from "@blazell/validators";
import type { WriteTransaction } from "replicache";
import { getEntityFromID } from "./util/get-id";
import type { Variant } from "@blazell/validators/client";

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

export { createVariant, updateVariant, deleteVariant };
