import type { WriteTransaction } from "replicache";

import type { CreateLineItem, UpdateLineItem } from "@blazell/validators";
import { getEntityFromID } from "./util/get-id";
import type { LineItem } from "@blazell/validators/client";
import { createCart } from "./cart";

async function createLineItem(tx: WriteTransaction, input: CreateLineItem) {
	const { lineItem, newCartID } = input;
	if (newCartID) {
		console.log("Creating new cart");
		await createCart(tx, {
			cart: {
				id: newCartID,
				createdAt: new Date().toISOString(),
				replicachePK: newCartID,
				//TODO: get country code
				countryCode: "AU",
				currencyCode: "AUD",
			},
		});
	}
	await tx.set(lineItem.replicachePK, lineItem);
}

async function updateLineItem(tx: WriteTransaction, input: UpdateLineItem) {
	const { id, quantity } = input;
	const lineItem = (await getEntityFromID(tx, id)) as LineItem | undefined;

	if (!lineItem) {
		console.info("Line item  not found");
		throw new Error("Line item not found");
	}

	await tx.set(lineItem.replicachePK, {
		...lineItem,
		quantity,
	});
}

async function deleteLineItem(tx: WriteTransaction, input: { id: string }) {
	const { id } = input;
	const lineItem = (await getEntityFromID(tx, id)) as LineItem | undefined;

	if (!lineItem) {
		console.info("Line item  not found");
		throw new Error("Line item not found");
	}

	await tx.del(lineItem.replicachePK);
}

export { createLineItem, deleteLineItem, updateLineItem };
