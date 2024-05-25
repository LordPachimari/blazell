import type { WriteTransaction } from "replicache";

import type {
	CreateStore,
	DeleteStoreImage,
	SetActiveStoreID,
	UpdateStore,
} from "@blazell/validators";
import type { Store } from "@blazell/validators/client";
import { getEntityFromID } from "./util/get-id";

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

	return tx.set(store.replicachePK, {
		...store,
		...(updates.currencyCodes && { currencyCodes: updates.currencyCodes }),
		...(updates.description && { description: updates.description }),
		...(updates.storeImage && updates.storeCroppedImage
			? {
					storeImage: {
						...updates.storeImage,
						croppedImage: updates.storeCroppedImage,
					},
				}
			: updates.storeCroppedImage
				? {
						storeImage: {
							...store.storeImage,
							croppedImage: updates.storeCroppedImage,
						},
					}
				: {}),
		...(updates.headerImage && updates.headerCroppedImage
			? {
					headerImage: {
						...updates.headerImage,
						croppedImage: updates.headerCroppedImage,
					},
				}
			: updates.headerCroppedImage
				? {
						headerImage: {
							...store.headerImage,
							croppedImage: updates.headerCroppedImage,
						},
					}
				: {}),
	});
}

async function setActiveStoreID(tx: WriteTransaction, input: SetActiveStoreID) {
	const { id } = input;

	return tx.set("active_store_id", {
		value: id,
	});
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
		type === "store"
			? { ...store, storeImage: null }
			: { ...store, headerImage: null },
	);
}

export { createStore, deleteStoreImage, setActiveStoreID, updateStore };
