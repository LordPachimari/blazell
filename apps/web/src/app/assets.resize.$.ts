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
import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import type { FitEnum } from "sharp";
import sharp from "sharp";

const ASSETS_ROOT = "assets";

interface ResizeParams {
	src: string;
	width: number | undefined;
	height: number | undefined;
	fit: keyof FitEnum;
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	// extract all the parameters from the url
	const { src, width, height, fit } = extractParams(params, request);

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
		// read the image from the file system and stream it through the sharp pipeline
		return streamingResize(readStream, width, height, fit);
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
const pipelineAsync = promisify(pipeline);
async function streamingResize(
	imageStream: ReadableStream,
	width: number | undefined,
	height: number | undefined,
	fit: keyof FitEnum,
) {
	// Convert Web ReadableStream to Node.js Readable Stream
	//@ts-ignore
	const nodeReadableStream = Readable.fromWeb(imageStream);
	// create the sharp transform pipeline
	// https://sharp.pixelplumbing.com/api-resize
	// you can also add watermarks, sharpen, blur, etc.
	const sharpTransforms = sharp()
		.resize({
			width,
			height,
			fit,
			position: sharp.strategy.attention, // will try to crop the image and keep the most interesting parts
		})
		// .jpeg({
		//   mozjpeg: true, // use mozjpeg defaults, = smaller images
		//   quality: 80,
		// });
		// sharp also has other image formats, just comment out .jpeg and make sure to change the Content-Type header below
		// .avif({
		//   quality: 80,
		// })
		// .png({
		//   quality: 80,
		// })
		.webp({
			quality: 80,
		});

	// create a pass through stream that will take the input image
	// stream it through the sharp pipeline and then output it to the response
	// without buffering the entire image in memory
	const passthroughStream = new PassThrough();

	// Use the pipeline utility to handle the piping
	await pipelineAsync(nodeReadableStream, sharpTransforms, passthroughStream);

	return new Response(passthroughStream as any, {
		headers: {
			"Content-Type": "image/webp",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}

async function readFileAsStream(src: string): Promise<ReadableStream | null> {
	const result = await fetch(src);
	const body = await result.body;

	return body;
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
