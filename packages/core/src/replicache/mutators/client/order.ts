import type { CreateOrder } from "@pachi/validators";
import type { WriteTransaction } from "replicache";

async function createOrder(tx: WriteTransaction, input: CreateOrder) {
	const { order } = input;
	await tx.set(order.replicachePK, order);
}
export { createOrder };
