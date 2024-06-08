import { Hono } from "hono";

const app = new Hono<{
	Bindings: {
		ENVIRONMENT: "development" | "production";
		R2: R2Bucket;
	};
}>();
app.get("/images/:key", async (c) => {
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
		console.log("key", key);
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

app.get("/transform", async (c) => {
	const request = c.req.raw;
	const url = new URL(request.url);

	const options = { cf: { image: {} } };
	console.log("step 1");

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

	const accept = request.headers.get("Accept") as string;
	if (/image\/avif/.test(accept)) {
		//@ts-ignore
		options.cf.image.format = "avif";
	} else if (/image\/webp/.test(accept)) {
		//@ts-ignore
		options.cf.image.format = "webp";
	} else if (/image\/jpeg/.test(accept)) {
		//@ts-ignore
		options.cf.image.format = "jpeg";
	} else if (/image\/png/.test(accept)) {
		//@ts-ignore
		options.cf.image.format = "png";
	} else {
		//@ts-ignore
		options.cf.image.format = "jpeg"; // Fallback to jpeg if no preferred format is found
	}

	const imageURL = url.searchParams.get("image");
	console.log("step 2 imageURL", imageURL);
	if (!imageURL) {
		return c.text('Missing "image" value', 400);
	}

	try {
		const { hostname } = new URL(imageURL);

		console.log("step 3 imageURL", imageURL);

		// if (!/\.(jpe?g|png|gif|webp|bmp|tiff|svg)$/i.test(pathname)) {
		// 	return c.text("Disallowed file extension", 400);
		// }
		console.log("hostname", hostname);

		if (c.env.ENVIRONMENT === "production" && hostname !== "blazell.com") {
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
		if (!response.ok) {
			console.log("status text", response.statusText);
			console.log("status", response.status);
		}
		const newResponse = new Response(response.body, response);
		return newResponse;
	} catch (error) {
		return c.text("Error fetching image", 500);
	}
});
export default app;
