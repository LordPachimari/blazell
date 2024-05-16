import type { ReadonlyJSONValue, WriteTransaction } from "replicache";

import {
	UploadImagesSchema,
	type CreateStore,
	type DeleteStoreImage,
	type SetActiveStoreID,
	type UpdateStore,
	type UploadStoreImage,
} from "@pachi/validators";
import { getEntityFromID } from "./util/get-id";
import type { Store } from "@pachi/validators/client";

async function createStore(tx: WriteTransaction, input: CreateStore) {
	const { store } = input;
	await tx.set(store.replicachePK, store);
}

async function updateStore(tx: WriteTransaction, input: UpdateStore) {
	const { id, updates } = input;
	const store = (await getEntityFromID(tx, id)) as Store | undefined;

	if (!store) {
		console.info("Store  not found");
		throw new Error("Store not found");
	}
	const updatedStore = { ...store, ...updates };

	return tx.set(store.replicachePK, updatedStore);
}

async function setActiveStoreID(tx: WriteTransaction, input: SetActiveStoreID) {
	const { id } = input;

	return tx.set("active_store_id", {
		id: "active_store_id",
		value: { storeID: id },
	});
}
async function uploadStoreImage(tx: WriteTransaction, input: UploadStoreImage) {
	const { id, image, type } = input;

	const store = (await getEntityFromID(tx, id)) as Store | undefined;

	if (!store) {
		console.info("Store  not found");
		throw new Error("Store not found");
	}

	return tx.set(
		store.replicachePK,
		type === "storeImage"
			? { ...store, storeImage: image }
			: { ...store, headerImage: image },
	);
}
async function deleteStoreImage(tx: WriteTransaction, input: DeleteStoreImage) {
	const { storeID, type } = input;

	const store = (await getEntityFromID(tx, storeID)) as Store | undefined;

	if (!store) {
		console.info("Store  not found");
		throw new Error("Store not found");
	}

	return tx.set(
		store.replicachePK,
		type === "storeImage"
			? { ...store, storeImage: null }
			: { ...store, headerImage: null },
	);
}

export {
	createStore,
	setActiveStoreID,
	updateStore,
	uploadStoreImage,
	deleteStoreImage,
};
