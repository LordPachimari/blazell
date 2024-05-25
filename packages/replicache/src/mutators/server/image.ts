import {
	DeleteImageSchema,
	ImageUploadError,
	NeonDatabaseError,
	NotFound,
	UpdateImagesOrderSchema,
	UploadImagesSchema,
	UploadResponseSchema,
} from "@blazell/validators";
import { Effect, pipe } from "effect";
import type { Variant } from "@blazell/validators/server";
import { Cloudflare, Database } from "@blazell/shared";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";
import * as Http from "@effect/platform/HttpClient";
import type { Image } from "@blazell/db";
import * as base64 from "base64-arraybuffer";

const uploadImages = zod(UploadImagesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { env } = yield* Cloudflare;
		const { entityID, images } = input;

		let entity: Variant | undefined = undefined;
		const isVariant = entityID.startsWith("variant");

		if (images.length === 0) {
			return;
		}

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
		});

		const updatedImages = [
			...(entity.images ? entity.images : []),
			...uploaded,
		];

		return yield* tableMutator.update(
			entityID,
			{ images: updatedImages },
			"variants",
		);
	}),
);

const deleteImage = zod(DeleteImageSchema, (input) => {
	return Effect.gen(function* () {
		const { cloudflareID, imageID, entityID } = input;

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

		if (!cloudflareID)
			return yield* tableMutator.update(
				entityID,
				{
					images: entity.images?.filter((image) => image.id !== imageID) ?? [],
				},
				"variants",
			);

		yield* Http.request
			.del(
				`https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/images/v1/${imageID}`,
			)
			.pipe(
				Http.request.setHeaders({
					Authorization: `Bearer ${env.IMAGE_API_TOKEN}`,
				}),
				Http.client.fetch,
				Effect.retry({ times: 3 }),
				Effect.scoped,
				Effect.orDie,
				Effect.zipLeft(
					tableMutator.update(
						entityID,
						{
							images:
								entity.images?.filter((image) => image.id !== imageID) ?? [],
						},
						"variants",
					),
				),
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

			if (o) image.order = o;
		}
		images.sort((a, b) => a.order - b.order);

		return yield* tableMutator.update(entityID, { images }, "variants");
	}),
);

export { uploadImages, deleteImage, updateImagesOrder };
