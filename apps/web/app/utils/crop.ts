import type { Area } from "~/types/crop";
import * as base64 from "base64-arraybuffer";
import type { Image } from "@blazell/validators";
import { generateID } from "@blazell/utils";
import { satisfies } from "effect/Function";
export const createImage = (url: string) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.setAttribute("crossorigin", "anonymous");
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});

export function getRadianAngle(degreeValue: number) {
	return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
	const rotRad = getRadianAngle(rotation);

	return {
		width:
			Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height:
			Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	};
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area,
	rotation = 0,
	flip = { horizontal: false, vertical: false },
): Promise<Image | undefined> {
	console.log("pixelCrop", pixelCrop);
	const image = (await createImage(imageSrc)) as HTMLImageElement;
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	console.log("ctx", ctx);

	if (!ctx) {
		return undefined;
	}

	const rotRad = getRadianAngle(rotation);

	// calculate bounding box of the rotated image
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
		image.width,
		image.height,
		rotation,
	);

	// set canvas size to match the bounding box
	canvas.width = bBoxWidth;
	canvas.height = bBoxHeight;

	// translate canvas context to a central location to allow rotating and flipping around the center
	ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
	ctx.rotate(rotRad);
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
	ctx.translate(-image.width / 2, -image.height / 2);

	// draw rotated image
	ctx.drawImage(image, 0, 0);

	const croppedCanvas = document.createElement("canvas");

	const croppedCtx = croppedCanvas.getContext("2d");

	if (!croppedCtx) {
		return undefined;
	}
	// Set the size of the cropped canvas
	croppedCanvas.width = pixelCrop.width;
	croppedCanvas.height = pixelCrop.height;

	// Draw the cropped image onto the new canvas
	croppedCtx.drawImage(
		canvas,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height,
	);
	// As Base64 string
	// return croppedCanvas.toDataURL('image/jpeg');

	// As a blob
	return new Promise((resolve) => {
		croppedCanvas.toBlob((file) => {
			console.log("hey");
			console.log("file", file);
			if (file) {
				const fileReader = new FileReader();
				fileReader.onloadend = () => {
					if (fileReader.result instanceof ArrayBuffer) {
						const base64String = base64.encode(fileReader.result);
						const imageKey = generateID({ prefix: "img" });
						return resolve({
							id: imageKey,
							fileType: file.type,
							uploaded: false,
							url: `${window.ENV.WORKER_URL}/images/${imageKey}`,
							name: "cropped",
							order: 0,
							base64: base64String,
						} satisfies Image);
					}
				};
				fileReader.readAsArrayBuffer(file);
			} else {
				resolve(undefined);
			}
		}, "image/jpeg");
	});
}
