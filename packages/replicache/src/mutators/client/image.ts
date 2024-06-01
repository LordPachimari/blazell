import type {
	DeleteImage,
	UpdateImagesOrder,
	UploadImages,
} from "@blazell/validators";
import type { Variant } from "@blazell/validators/client";
import type { WriteTransaction } from "replicache";
import { entityNotFound } from "./price";
import { getEntityFromID } from "./util/get-id";

async function updateImagesOrder(
	tx: WriteTransaction,
	input: UpdateImagesOrder,
) {
	const { order, entityID } = input;

	const entity = (await getEntityFromID(tx, entityID)) as Variant | undefined;
	const isVariant =
		entityID.startsWith("variant") || entityID.startsWith("variant_default");

	if (!entity) {
		return entityNotFound(entityID);
	}

	const images = entity.images ? structuredClone(entity.images) : [];

	for (const image of images) {
		const o = order[image.id];
		if (o !== undefined) image.order = o;
	}
	images.sort((a, b) => a.order - b.order);

	return await tx.set(entity.replicachePK, {
		...entity,
		images,
		...(isVariant && { thumbnail: images[0] }),
	});
}

async function uploadImages(tx: WriteTransaction, input: UploadImages) {
	const { entityID, images } = input;

	const entity = (await getEntityFromID(tx, entityID)) as Variant | undefined;
	const isVariant =
		entityID.startsWith("variant") || entityID.startsWith("variant_default");

	if (!entity) {
		return entityNotFound(entityID);
	}

	if (images.length === 0) {
		return;
	}

	const updatedImages = [...(entity.images ? entity.images : []), ...images];

	return await tx.set(entity.replicachePK, {
		...entity,
		images: updatedImages,
		...(isVariant && { thumbnail: updatedImages[0] }),
	});
}

async function deleteImage(tx: WriteTransaction, input: DeleteImage) {
	const { imageID, entityID } = input;

	const entity = (await getEntityFromID(tx, entityID)) as Variant | undefined;

	if (!entity) {
		return entityNotFound(entityID);
	}

	await tx.set(entity.replicachePK, {
		...entity,
		images: entity.images?.filter((image) => image.id !== imageID),
	});
}
export { deleteImage, updateImagesOrder, uploadImages };
