import { Elysia } from "elysia";
import type { Readable } from "node:stream";
import type { FitEnum } from "sharp";
import sharp from "sharp";

const app = new Elysia()
	.get("/", () => ({ hello: "Bun.js👋" }))
	.get("/transform", async ({ query }) => {
		// extract all the parameters from the url
		const { src, width, height, fit, quality } = extractParams(
			query as Record<string, string>,
		);

		try {
			if (!src.startsWith("http")) throw new Error("Invalid URL");
			// read the image as a stream of bytes
			// const readStream = await readFileAsStream(src);
			// read the image from the file system and stream it through the sharp pipeline
			return streamingResize(src, width, height, fit, quality);
		} catch (error: unknown) {
			// if the image is not found, or we get any other errors we return different response types
			return handleError(error);
		}
	})
	.listen(8080);

console.log(`Listening on http://localhost:${app.server!.port}`);

/**
 * An on the fly image resizer
 *
 * Since most of our images are served via a CDN, we don't have to save the resized images.
 * Instead we set cache headers for them and let the cdn cache them for us.
 *
 * sharp uses a highly performant native package called libvips.
 * it's written in C and is extremely fast.
 *
 * The implementation of the demo uses a stream based approach where the image is never stored in memory.
 * This means it's very good at handling images of any size, and is extremely performant.
 * Further improvements could be done by implementing ETags, but that is out of scope for this demo.
 */

interface ResizeParams {
	src: string;
	width: number | undefined;
	height: number | undefined;
	fit: keyof FitEnum;
	quality: number | undefined;
}

function extractParams(query: Record<string, string>): ResizeParams {
	const src = query.src!;
	const width = query.width ? Number.parseInt(query.width ?? "0") : undefined;
	const height = query.height
		? Number.parseInt(query.height ?? "0")
		: undefined;
	const quality = query.quality ? Number.parseInt(query.quality ?? "80") : 80;

	const fitEnum = ["contain", "cover", "fill", "inside", "outside"];
	let fit: keyof FitEnum = sharp.fit.contain;
	if (query.fit) {
		if (fitEnum.includes(query.fit)) {
			fit = query.fit as keyof FitEnum;
		}
	}
	return { src, width, height, fit, quality };
}
type FileType = "image/jpeg" | "image/png" | "image/avif" | "image/webp";

async function streamingResize(
	src: string,
	width: number | undefined,
	height: number | undefined,
	fit: keyof FitEnum,
	quality: number | undefined,
) {
	// create the sharp transform pipeline
	// https://sharp.pixelplumbing.com/api-resize
	// you can also add watermarks, sharpen, blur, etc.
	const response = await fetch(src);
	const imageArrayBuffer = await response.arrayBuffer();
	const imageBuffer = Buffer.from(imageArrayBuffer);
	const type = response.headers.get("Content-Type");
	const sharpTransforms = sharp(imageBuffer).resize({
		width,
		height,
		fit,
		position: sharp.strategy.attention, // will try to crop the image and keep the most interesting parts
	});

	switch (type) {
		case "image/jpeg":
			sharpTransforms.jpeg({
				quality: quality ?? 90,
				mozjpeg: true, // Use mozjpeg defaults for smaller images
			});
			break;
		case "image/png":
			sharpTransforms.png({
				quality: quality ?? 90,
			});
			break;
		case "image/avif":
			sharpTransforms.avif({
				quality: quality ?? 90,
			});
			break;
		default:
			sharpTransforms.webp({
				quality: quality ?? 90,
			});
			break;
	}
	const resizedImageBuffer = await sharpTransforms.toBuffer();

	return new Response(resizedImageBuffer, {
		headers: {
			"Content-Type": type as string,
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
type ImageStream = {
	body: Readable;
	fileType: FileType;
};

function handleError(error: unknown) {
	// error needs to be typed
	const errorT = error as Error & { code: string };
	// if the read stream fails, it will have the error.code ENOENT
	if (errorT.code === "ENOENT") {
		return new Response("image not found", {
			status: 404,
			headers: {
				"Content-Type": "text/plain",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	}

	// if there is an error processing the image, we return a 500 error
	return new Response(errorT.message, {
		status: 500,
		statusText: errorT.message,
		headers: {
			"Content-Type": "text/plain",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
