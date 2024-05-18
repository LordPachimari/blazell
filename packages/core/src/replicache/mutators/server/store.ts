import { Effect } from "effect";

import {
	CreateStoreSchema,
	DeleteStoreImageSchema,
	SetActiveStoreIDSchema,
	UpdateStoreSchema,
	UploadStoreImageSchema,
	type Image,
} from "@pachi/validators";

import { Cloudflare, Database, TableMutator } from "../../../..";
import { zod } from "../../../util/zod";

const createStore = zod(CreateStoreSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { store } = input;

		return yield* _(tableMutator.set(store, "stores"));
	}),
);

const updateStore = zod(UpdateStoreSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id, updates } = input;

		return yield* _(tableMutator.update(id, updates, "stores"));
	}),
);
const setActiveStoreID = zod(SetActiveStoreIDSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id } = input;

		return yield* _(
			tableMutator.update(
				"active_store_id",
				{ id: "active_store_id", storeID: id },
				"json",
			),
		);
	}),
);

const uploadStoreImage = zod(UploadStoreImageSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { manager } = yield* Database;
		const { R2 } = yield* Cloudflare;
		const { id, image, type } = input;

		const store = yield* Effect.tryPromise(() =>
			manager.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.id, id),
			}),
		);

		const newImage: Image = {
			id: image.id,
			name: image.name,
			order: image.order,
			url: image.url,
			...(image.croppedUrl && { croppedUrl: image.croppedUrl }),
		};
		const effects = [
			tableMutator.update(
				id,
				type === "storeImage"
					? { storeImage: newImage }
					: { headerImage: newImage },
				"stores",
			),
		];
		if (type === "headerImage" && store?.headerImage) {
			effects.push(
				Effect.tryPromise(() =>
					R2.delete(`images/${store.headerImage!.id}`),
				).pipe(Effect.orDie),
			);
		}
		if (type === "storeImage" && store?.storeImage) {
			effects.push(
				Effect.tryPromise(() =>
					R2.delete(`images/${store.storeImage!.id}`),
				).pipe(Effect.orDie),
			);
		}

		return yield* Effect.all(effects, { concurrency: 2 });
	}),
);
const deleteStoreImage = zod(DeleteStoreImageSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { R2 } = yield* Cloudflare;
		const { imageID, storeID, type } = input;

		return Effect.all(
			[
				Effect.tryPromise(() => R2.delete(`images/${imageID}`)).pipe(
					Effect.orDie,
				),
				tableMutator.update(
					storeID,
					type === "storeImage" ? { storeImage: null } : { headerImage: null },
					"stores",
				),
			],
			{ concurrency: 2 },
		);
	}),
);

export {
	createStore,
	updateStore,
	setActiveStoreID,
	uploadStoreImage,
	deleteStoreImage,
};
