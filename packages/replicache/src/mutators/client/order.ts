import type { CreateOrder } from "@blazell/validators";
import type { WriteTransaction } from "replicache";

async function createOrder(tx: WriteTransaction, input: CreateOrder) {
	const { order } = input;
	await tx.set(order.id, order);
}
export { createOrder };
