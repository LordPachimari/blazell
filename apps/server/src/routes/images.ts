import * as Http from "@effect/platform/HttpClient";
import { getAuth } from "@hono/clerk-auth";
import { UploadResponseSchema, type Bindings } from "@blazell/validators";
import { Effect, pipe } from "effect";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:key", async (c) => {
	const key = c.req.param("key");
	const cacheKey = new Request(c.req.url.toString(), c.req);
	const cache = caches.default;

	let response = await cache.match(cacheKey);

	if (response) {
		console.log(`Cache hit for: ${c.req.url}.`);
		return new Response(response.body, response);
	}

	const object = await c.env.R2.get(`images/${key}`);

	if (object === null) {
		return c.text("Image Not Found", { status: 404 });
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");

	response = new Response(object.body, {
		headers,
	});

	c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
	return response;
});
app.post("/upload", async (c) => {
	const auth = getAuth(c);
	if (!auth?.userId) return c.text("Unauthorized", 401);
	const body = await c.req.parseBody();
	if (!body.file) {
		return c.text("No file found", 400);
	}

	await Effect.runPromise(
		pipe(
			Effect.sync(() => {
				const formData = new FormData();
				formData.append("file", body.file as string);
				return formData;
			}),
			Effect.map((formData) =>
				Http.request
					.post(
						`api.cloudflare.com/client/v4/accounts/${c.env.ACCOUNT_ID}/images/v1`,
					)
					.pipe(
						Http.request.formDataBody(formData),
						Http.client.fetch,
						Effect.andThen(Http.response.schemaBodyJson(UploadResponseSchema)),
						Effect.retry({ times: 3 }),
						Effect.scoped,
					),
			),
		),
	);

	return c.text("Uploaded successfully", 200);
});

app.get("/transform", async (c) => {
	const request = c.req.raw;
	const url = new URL(request.url);

	const options = { cf: { image: {} } };

	if (url.searchParams.has("fit"))
		//@ts-ignore
		options.cf.image.fit = url.searchParams.get("fit");
	if (url.searchParams.has("width"))
		//@ts-ignore
		options.cf.image.width = url.searchParams.get("width");
	if (url.searchParams.has("height"))
		//@ts-ignore
		options.cf.image.height = url.searchParams.get("height");
	if (url.searchParams.has("quality"))
		//@ts-ignore
		options.cf.image.quality = url.searchParams.get("quality");
	if (url.searchParams.has("gravity")) {
		const gravity = url.searchParams.get("gravity")!.split(",");
		if (gravity.length === 2) {
			//@ts-ignore
			options.cf.image.gravity = {
				x: Number.parseFloat(gravity[0]!),
				y: Number.parseFloat(gravity[1]!),
			};
		}
	}

	// const accept = request.headers.get("Accept");
	// if (/image\/avif/.test(accept)) {
	// 	options.cf.image.format = "avif";
	// } else if (/image\/webp/.test(accept)) {
	// 	options.cf.image.format = "webp";
	// }

	const imageURL = url.searchParams.get("image");
	if (!imageURL) {
		return c.text('Missing "image" value', 400);
	}

	try {
		const { hostname } = new URL(imageURL);

		// if (!/\.(jpe?g|png|gif|webp)$/i.test(pathname)) {
		// 	return c.text("Disallowed file extension", 400);
		// }

		if (hostname !== "blazell.com") {
			return c.text('Must use "blazell.com" source images', 403);
		}
	} catch (err) {
		return c.text('Invalid "image" value', 400);
	}

	const imageRequest = new Request(imageURL, {
		headers: request.headers,
	});

	try {
		const response = await fetch(imageRequest, options);
		const newResponse = new Response(response.body, response);
		return newResponse;
	} catch (error) {
		return c.text("Error fetching image", 500);
	}
});

export default app;
