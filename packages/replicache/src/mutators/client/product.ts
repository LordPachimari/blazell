import type { WriteTransaction } from "replicache";

import { generateReplicachePK } from "@blazell/utils";
import type {
	CreateProduct,
	DeleteInput,
	InsertVariant,
	UpdateProduct,
} from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
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
		productID: product.id,
	};

	await tx.set(product.replicachePK, { ...product, defaultVariant });
	await tx.set(defaultVariant.replicachePK, defaultVariant);
}

async function deleteProduct(tx: WriteTransaction, input: DeleteInput) {
	const { id } = input;
	const product = (await getEntityFromID(tx, id)) as Product | undefined;
	product && (await tx.del(product.replicachePK));
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

export { createProduct, deleteProduct, publishProduct, updateProduct };
