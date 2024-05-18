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
import { PassThrough, Readable, pipeline } from "node:stream";
import { promisify } from "node:util";
import {
	createReadableStreamFromReadable,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import type { FitEnum } from "sharp";
import sharp from "sharp";
import { createReadStream, statSync, type ReadStream } from "node:fs";
import path from "node:path";

type ContentType = "image/jpeg" | "image/png" | "image/avif" | "image/webp";
const ASSETS_ROOT = "assets";
type ImageStream = { contentType: ContentType; body: Readable };

interface ResizeParams {
	src: string;
	width: number | undefined;
	height: number | undefined;
	fit: keyof FitEnum;
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	// extract all the parameters from the url
	const { src, width, height, fit } = extractParams(params, request);
	console.log("hello from loader", src, width, height, fit);
	try {
		// read the image as a stream of bytes
		const readStream = await readFileAsStream(src);
		if (!readStream)
			return new Response("image not found", {
				status: 404,
				headers: {
					"Content-Type": "text/plain",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
			});
		console.log("hello frmo image", src, readStream.contentType);
		// read the image from the file system and stream it through the sharp pipeline
		return streamingResize(
			readStream,
			width,
			height,
			fit,
			readStream.contentType,
		);
	} catch (error: unknown) {
		// if the image is not found, or we get any other errors we return different response types
		return handleError(error);
	}
};

function extractParams(params: Params<string>, request: Request): ResizeParams {
	const src = params["*"] as string;
	const searchParams = new URL(request.url).searchParams;

	const width = searchParams.has("w")
		? Number.parseInt(searchParams.get("w") ?? "0")
		: undefined;
	const height = searchParams.has("h")
		? Number.parseInt(searchParams.get("h") ?? "0")
		: undefined;

	const fitEnum = ["contain", "cover", "fill", "inside", "outside"];
	let fit: keyof FitEnum = sharp.fit.contain;
	if (searchParams.has("fit")) {
		const fitParam = searchParams.get("fit") ?? "";
		if (fitEnum.includes(fitParam)) {
			fit = fitParam as keyof FitEnum;
		}
	}
	return { src, width, height, fit };
}
async function streamingResize(
	imageStream: ImageStream,
	width: number | undefined,
	height: number | undefined,
	fit: keyof FitEnum,
	format: ContentType,
) {
	// create the sharp transform pipeline
	// https://sharp.pixelplumbing.com/api-resize
	// you can also add watermarks, sharpen, blur, etc.
	const sharpTransforms = sharp().resize({
		width,
		height,
		fit,
		position: sharp.strategy.attention, // will try to crop the image and keep the most interesting parts
	});
	// .jpeg({
	//   mozjpeg: true, // use mozjpeg defaults, = smaller images
	//   quality: 80,
	// });
	// sharp also has other image formats, just comment out .jpeg and make sure to change the Content-Type header below
	// .avif({
	//   quality: 80,
	// })

	switch (format) {
		case "image/jpeg":
			sharpTransforms.jpeg({
				quality: 80,
				mozjpeg: true, // Use mozjpeg defaults for smaller images
			});
			break;
		case "image/png":
			sharpTransforms.png({
				quality: 80,
			});
			break;
		case "image/avif":
			sharpTransforms.avif({
				quality: 80,
			});
			break;
		default:
			sharpTransforms.webp({
				quality: 80,
			});
			break;
	}
	// create a pass through stream that will take the input image
	// stream it through the sharp pipeline and then output it to the response
	// without buffering the entire image in memory
	const passthroughStream = new PassThrough();

	if (!imageStream.body) {
		return new Response("image not found", {
			status: 404,
			headers: {
				"Content-Type": format,
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	}

	imageStream.body.pipe(sharpTransforms).pipe(passthroughStream);

	return new Response(passthroughStream as any, {
		headers: {
			"Content-Type": format,
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
function getFileExtension(filename: string) {
	// Find the last dot in the filename
	const lastDotIndex = filename.lastIndexOf(".");

	// If there is no dot, return an empty string
	if (lastDotIndex === -1) {
		return "";
	}

	// Extract and return the substring after the last dot
	return filename.substring(lastDotIndex + 1);
}

async function readFileAsStream(src: string): Promise<ImageStream> {
	if (src.startsWith("http")) {
		const result = await fetch(src);
		const type = result.headers.get("Content-type") || "image/jpeg";
		if (!result.body) throw new Error("Image not found");
		const bodyIterable: AsyncIterable<any> = {
			[Symbol.asyncIterator]() {
				const reader = result.body?.getReader();
				return {
					async next() {
						const { done, value } = (await reader?.read()) ?? {
							done: true,
							value: undefined,
						};
						return { done, value };
					},
				};
			},
		};
		const stream = Readable.from(bodyIterable, {
			objectMode: false,
			highWaterMark: 16,
		});
		return {
			body: stream,
			contentType: type as ContentType,
		};
	}
	// Local filesystem

	// check that file exists
	const srcPath = path.join(ASSETS_ROOT, src);
	const fileStat = statSync(srcPath);
	if (!fileStat.isFile()) {
		throw new Error(`${srcPath} is not a file`);
	}
	// create a readable stream from the image file
	return {
		body: createReadStream(path.join(ASSETS_ROOT, src)),
		contentType: `image/${getFileExtension(src)}` as ContentType,
	};
}

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
