import { Effect, pipe } from "effect";

import type { Image } from "@blazell/db";
import { Cloudflare, Database } from "@blazell/shared";
import {
	CreateStoreSchema,
	DeleteStoreImageSchema,
	ImageUploadError,
	NeonDatabaseError,
	NotFound,
	SetActiveStoreIDSchema,
	UpdateStoreSchema,
} from "@blazell/validators";
import * as base64 from "base64-arraybuffer";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

const createStore = zod(CreateStoreSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { store } = input;

		return yield* tableMutator.set(store, "stores");
	}),
);

const updateStore = zod(UpdateStoreSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { env } = yield* Cloudflare;
		const { id, updates } = input;

		const store = yield* Effect.tryPromise(() =>
			manager.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.id, id),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		if (!store) {
			return yield* Effect.fail(
				new NotFound({ message: `Entity not found: id = ${id}` }),
			);
		}
		const imagesToUpload: Image[] = [];
		const imagesToDelete: string[] = [];
		/* upload */
		updates.storeImage && imagesToUpload.push(updates.storeImage);
		updates.storeCroppedImage && imagesToUpload.push(updates.storeCroppedImage);
		updates.headerImage && imagesToUpload.push(updates.headerImage);
		updates.headerCroppedImage &&
			imagesToUpload.push(updates.headerCroppedImage);

		/* delete */
		store.storeImage &&
			updates.storeImage &&
			imagesToDelete.push(store.storeImage.id);
		store.storeImage?.croppedImage &&
			updates.storeCroppedImage &&
			imagesToDelete.push(store.storeImage.croppedImage.id);
		store.headerImage &&
			updates.headerImage &&
			imagesToDelete.push(store.headerImage.id);
		store.headerImage?.croppedImage &&
			updates.headerCroppedImage &&
			imagesToDelete.push(store.headerImage.croppedImage.id);

		const uploadEffect = Effect.forEach(
			imagesToUpload,
			(image) => {
				return pipe(
					Effect.gen(function* () {
						if (!image.base64)
							return yield* new ImageUploadError({
								message: "Image not found. Base 64 not found",
							});
						const decoded = base64.decode(image.base64);
						const bytes = new Uint8Array(decoded);
						const file = new File([bytes], "store image", {
							type: image.fileType,
						});
						return file;
					}),
					Effect.flatMap((file) =>
						Effect.tryPromise(() =>
							env.R2.put(`images/${image.id}`, file, {
								httpMetadata: {
									contentType: image.fileType,
								},
							}),
						).pipe(
							Effect.retry({ times: 3 }),
							Effect.catchTags({
								UnknownException: (error) =>
									new ImageUploadError({ message: error.message }),
							}),
						),
					),
					Effect.flatMap(() =>
						Effect.gen(function* () {
							return yield* Effect.succeed({
								id: image.id,
								url: image.url,
								order: image.order,
								name: image.name,
								uploaded: true,
								fileType: image.fileType,
							} satisfies Image);
						}),
					),
				);
			},
			{
				concurrency: 4,
			},
		);
		const deleteEffect = Effect.forEach(
			imagesToDelete,
			(id) =>
				Effect.tryPromise(() => env.R2.delete(`images/${id}`)).pipe(
					Effect.retry({ times: 3 }),
					Effect.catchTags({
						UnknownException: (error) =>
							new ImageUploadError({ message: error.message }),
					}),
				),
			{
				concurrency: 4,
			},
		);

		yield* Effect.all([uploadEffect, deleteEffect], { concurrency: 2 }).pipe(
			Effect.map(([uploaded]) => {
				const map = new Map<string, Image>();
				for (const image of uploaded) {
					map.set(image.id, image);
				}
				const object = {
					storeImage: map.get(updates.storeImage?.id ?? "") ?? null,
					storeCroppedImage:
						map.get(updates.storeCroppedImage?.id ?? "") ?? null,
					headerImage: map.get(updates.headerImage?.id ?? "") ?? null,
					headerCroppedImage:
						map.get(updates.headerCroppedImage?.id ?? "") ?? null,
				};
				console.log("object", object);
				return object;
			}),
			Effect.flatMap(
				({ headerCroppedImage, headerImage, storeCroppedImage, storeImage }) =>
					tableMutator.update(
						store.id,
						{
							...(updates.description && { description: updates.description }),
							...(updates.currencyCodes && {
								currencyCodes: updates.currencyCodes,
							}),
							...(storeImage && storeCroppedImage
								? {
										storeImage: {
											...storeImage,
											croppedImage: storeCroppedImage,
										},
									}
								: storeCroppedImage
									? {
											storeImage: {
												...store.storeImage,
												croppedImage: storeCroppedImage,
											},
										}
									: {}),
							...(headerImage && headerCroppedImage
								? {
										headerImage: {
											...headerImage,
											croppedImage: headerCroppedImage,
										},
									}
								: headerCroppedImage
									? {
											headerImage: {
												...store.headerImage,
												croppedImage: headerCroppedImage,
											},
										}
									: {}),
						},
						"stores",
					),
			),
		);
	}),
);

const deleteStoreImage = zod(DeleteStoreImageSchema, (input) =>
	Effect.gen(function* () {
		const { id, storeID, type } = input;
		const { env } = yield* Cloudflare;
		const tableMutator = yield* TableMutator;

		yield* Effect.all(
			[
				Effect.tryPromise(() => env.R2.delete(`images/${id}`)).pipe(
					Effect.retry({ times: 3 }),
					Effect.catchTags({
						UnknownException: (error) =>
							new ImageUploadError({ message: error.message }),
					}),
				),
				tableMutator.update(
					storeID,
					{
						[type === "store" ? "storeImage" : "headerImage"]: null,
					},
					"stores",
				),
			],
			{ concurrency: 2 },
		);
	}),
);
const setActiveStoreID = zod(SetActiveStoreIDSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { id } = input;

		return yield* _(
			tableMutator.update("active_store_id", { value: id }, "json"),
		);
	}),
);

export { createStore, deleteStoreImage, setActiveStoreID, updateStore };
