import { Console, Effect, pipe } from "effect";

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
	UploadResponseSchema,
} from "@blazell/validators";
import * as base64 from "base64-arraybuffer";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";
import * as Http from "@effect/platform/HttpClient";

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
			imagesToDelete.push(store.storeImage.url);
		store.storeImage?.croppedImage &&
			updates.storeCroppedImage &&
			imagesToDelete.push(store.storeImage.croppedImage.url);
		store.headerImage &&
			updates.headerImage &&
			imagesToDelete.push(store.headerImage.url);
		store.headerImage?.croppedImage &&
			updates.headerCroppedImage &&
			imagesToDelete.push(store.headerImage.croppedImage.url);

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
						const formData = new FormData();
						formData.append("file", file);
						return formData;
					}),
					Effect.flatMap((formData) =>
						Http.request
							.post(
								`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1`,
							)
							.pipe(
								Http.request.setHeaders({
									Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
								}),
								Http.request.formDataBody(formData),
								Http.client.fetch,
								Effect.flatMap(
									Http.response.schemaBodyJson(UploadResponseSchema),
								),
								Effect.scoped,
								Effect.orDie,
							),
					),
					Effect.flatMap((response) =>
						Effect.gen(function* () {
							if (response.errors.length > 0) {
								yield* Console.log("Error uploading image", response.errors);
								yield* new ImageUploadError({
									message: "Error uploading image",
								});
							}
							return response;
						}),
					),
					Effect.map(
						(response) =>
							({
								id: image.id,
								url: response.result?.variants[0]!,
								order: image.order,
								name: image.name,
								uploaded: true,
								fileType: image.fileType,
							}) satisfies Image,
					),
				);
			},
			{
				concurrency: 4,
			},
		);
		const deleteEffect = Effect.forEach(
			imagesToDelete,
			(url) =>
				Effect.gen(function* () {
					const splitted = url.split("/");
					const cloudflareID = splitted[splitted.length - 2];
					if (!cloudflareID) return;
					return yield* Http.request
						.del(
							`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1/${cloudflareID}`,
						)
						.pipe(
							Http.request.setHeaders({
								Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
							}),
							Http.client.fetch,
							Effect.retry({ times: 3 }),
							Effect.scoped,
							Effect.catchTags({
								RequestError: (e) =>
									Effect.gen(function* () {
										yield* Console.error("Error deleting image", e.message);

										return yield* Effect.succeed({});
									}),
								ResponseError: (e) =>
									Effect.gen(function* () {
										yield* Console.error("Error deleting image", e.message);

										return yield* Effect.succeed({});
									}),
							}),
						);
				}),

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
		const { storeID, type, url } = input;
		const { env } = yield* Cloudflare;
		const tableMutator = yield* TableMutator;
		const splitted = url.split("/");
		const cloudflareID = splitted[splitted.length - 2];

		yield* tableMutator.update(
			storeID,
			{
				[type === "store" ? "storeImage" : "headerImage"]: null,
			},
			"stores",
		);

		if (cloudflareID)
			yield* Http.request
				.del(
					`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1/${cloudflareID}`,
				)
				.pipe(
					Http.request.setHeaders({
						Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
					}),
					Http.client.fetch,
					Effect.retry({ times: 3 }),
					Effect.scoped,
					Effect.orDie,
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
