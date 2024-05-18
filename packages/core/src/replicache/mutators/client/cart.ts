import type { UpdateCart } from "@pachi/validators";
import type { WriteTransaction } from "replicache";
import { getEntityFromID } from "./util/get-id";
import type { Address } from "@pachi/validators/client";

async function updateCart(tx: WriteTransaction, input: UpdateCart) {
	const { id, updates } = input;
	const cart = (await getEntityFromID(tx, id)) as Address | undefined;

	if (!cart) {
		console.info("cart  not found");
		throw new Error("cart not found");
	}

	await tx.set(cart.replicachePK, {
		...cart,
		...updates,
	});
}
export { updateCart };
