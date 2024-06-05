import type { CreateCart, UpdateCart } from "@blazell/validators";
import type { Address } from "@blazell/validators/client";
import type { WriteTransaction } from "replicache";
async function createCart(tx: WriteTransaction, input: CreateCart) {
	const { cart } = input;

	await tx.set(cart.id, cart);
}

async function updateCart(tx: WriteTransaction, input: UpdateCart) {
	const { id, updates } = input;
	const cart = await tx.get<Address>(id);

	if (!cart) {
		console.info("cart  not found");
		throw new Error("cart not found");
	}

	await tx.set(id, {
		...cart,
		...updates,
	});
}
export { createCart, updateCart };
