import type { Image } from "@blazell/db";
import { Cloudflare, Database } from "@blazell/shared";
import {
	DeleteImageSchema,
	ImageUploadError,
	NeonDatabaseError,
	NotFound,
	UpdateImagesOrderSchema,
	UploadImagesSchema,
	UploadResponseSchema,
} from "@blazell/validators";
import type { Variant } from "@blazell/validators/server";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import * as base64 from "base64-arraybuffer";
import { Console, Effect, pipe } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

const uploadImages = zod(UploadImagesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { env } = yield* Cloudflare;
		const { entityID, images } = input;

		let entity: Pick<Variant, "images"> | undefined = undefined;
		const isVariant = entityID.startsWith("variant");

		if (images.length === 0) {
			return;
		}

		if (isVariant)
			entity = yield* Effect.tryPromise(() =>
				manager.query.variants.findFirst({
					where: (variants, { eq }) => eq(variants.id, entityID),
					columns: {
						images: true,
					},
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);

		if (!entity) {
			return yield* Effect.fail(
				new NotFound({ message: `Entity not found: id = ${entityID}` }),
			);
		}

		const uploaded = yield* Effect.forEach(images, (image) => {
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
					HttpClientRequest.post(
						`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1`,
					).pipe(
						HttpClientRequest.setHeaders({
							Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
						}),
						HttpClientRequest.formDataBody(formData),
						HttpClient.fetch,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(UploadResponseSchema),
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

				Effect.retry({ times: 3 }),
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
		});

		const updatedImages = [
			...(entity.images ? entity.images : []),
			...uploaded,
		];

		return yield* Effect.all([
			tableMutator.update(
				entityID,
				{ images: updatedImages, thumbnail: updatedImages[0] },
				"variants",
			),
		]);
	}),
);

const deleteImage = zod(DeleteImageSchema, (input) => {
	return Effect.gen(function* () {
		const { keys, entityID, urls } = input;

		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { env } = yield* Cloudflare;

		let entity: Variant | undefined = undefined;
		const isVariant = entityID.startsWith("variant");

		if (isVariant)
			entity = yield* Effect.tryPromise(() =>
				manager.query.variants.findFirst({
					where: (variants, { eq }) => eq(variants.id, entityID),
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);

		if (!entity) {
			return yield* Effect.fail(
				new NotFound({ message: `Entity not found: id ${entityID}` }),
			);
		}

		yield* tableMutator.update(
			entityID,
			{
				images:
					entity.images?.filter((image) => !keys.includes(image.id)) ?? [],
			},
			"variants",
		);
		yield* Effect.forEach(urls, (url) =>
			Effect.gen(function* () {
				const splitted = url.split("/");
				const cloudflareID = splitted[splitted.length - 2];

				if (cloudflareID)
					yield* HttpClientRequest.del(
						`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1/${cloudflareID}`,
					).pipe(
						HttpClientRequest.setHeaders({
							Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
						}),
						HttpClient.fetch,
						Effect.retry({ times: 3 }),
						Effect.scoped,
						Effect.catchAll((e) =>
							Effect.gen(function* () {
								yield* Console.error("Error deleting image", e.message);
								return {};
							}),
						),
					);
			}),
		);
	});
});

const updateImagesOrder = zod(UpdateImagesOrderSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { order, entityID } = input;
		let entity: Variant | undefined = undefined;
		const isVariant = entityID.startsWith("variant");

		if (isVariant)
			entity = yield* Effect.tryPromise(() =>
				manager.query.variants.findFirst({
					where: (variants, { eq }) => eq(variants.id, entityID),
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);

		if (!entity) {
			return yield* Effect.fail(
				new NotFound({ message: `Entity not found: id = ${entityID}` }),
			);
		}
		const images = structuredClone(entity.images) ?? [];

		for (const image of images) {
			const o = order[image.id];

			if (o !== undefined) image.order = o;
		}
		images.sort((a, b) => a.order - b.order);

		return yield* tableMutator.update(
			entityID,
			{ images, ...(isVariant && { thumbnail: images[0] }) },
			"variants",
		);
	}),
);

export { deleteImage, updateImagesOrder, uploadImages };
