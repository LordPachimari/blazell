import { drizzle } from "drizzle-orm/neon-serverless";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Pool } from "@neondatabase/serverless";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { createUser, pull, push, staticPull } from "@pachi/api";
import { schema, type Db } from "@pachi/db";
import { Cloudflare, Cookies, Database } from "@pachi/core";
import {
	CheckoutFormSchema,
	CreateUserSchema,
	SpaceIDSchema,
	pullRequestSchema,
	pushRequestSchema,
	type SpaceRecord,
} from "@pachi/validators";
import type { InsertOrder, LineItem } from "@pachi/validators/server";
import { z } from "zod";
import { cartSubtotal, generateID, generateReplicachePK } from "@pachi/utils";
import { eq, sql } from "drizzle-orm";

export type Bindings = {
	ORIGIN_URL: string;
	DATABASE_URL: string;
	ENVIRONMENT: "prod" | "test" | "staging" | "dev";
	BUCKET: R2Bucket;
	CLERK_SERCRET_KEY: string;
	CLERK_PUBLISHABLE_KEY: string;
	KV: KVNamespace;
	PARTYKIT_ORIGIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	"*",
	cors({
		origin: [
			"http://localhost:5173",
			"https://pachi-dev.vercel.app",
			"https://pachi.vercel.app",
		],
		allowMethods: ["POST", "GET", "OPTIONS"],
		maxAge: 600,
		credentials: true,
	}),
);
app.use("*", clerkMiddleware());

app.use("*", async (c, next) => {
	const client = new Pool({ connectionString: c.env.DATABASE_URL });
	const db = drizzle(client, { schema });

	c.set("db" as never, db);

	return next();
});

app.post("/pull/:spaceID", async (c) => {
	// 1: PARSE INPUT
	const auth = getAuth(c);
	const db = c.get("db" as never) as Db;
	const subspaceIDs = c.req.queries("subspaces");
	const spaceID = SpaceIDSchema.parse(c.req.param("spaceID"));
	const body = pullRequestSchema.parse(await c.req.json());
	const cartID = c.req.header("x-cart-id");
	console.log("subspaceIDs", subspaceIDs);

	// 2: PULL
	const pullEffect = Effect.provideService(
		pull({
			body,
			db,
			spaceID,
			subspaceIDs: subspaceIDs as SpaceRecord[typeof spaceID] | undefined,
			authID: auth?.userId,
		}),
		Cookies,
		{ cartID },
	).pipe(Effect.orDie);

	// 3: RUN PROMISE
	const pullResponse = await Effect.runPromise(pullEffect);

	return c.json(pullResponse, 200);
});

app.post("/static-pull", async (c) => {
	// 1: PARSE INPUT
	const db = c.get("db" as never) as Db;
	const body = pullRequestSchema.parse(await c.req.json());

	// 2: PULL
	const pullEffect = staticPull({ body }).pipe(
		Effect.provideService(Database, { manager: db }),
		Effect.provideService(Cloudflare, {
			KV: c.env.KV,
			countryCode: c.req.raw.headers.get("CF-IPCountry"),
			R2: c.env.BUCKET,
		}),
		Effect.orDie,
	);

	// 3: RUN PROMISE
	const pullResponse = await Effect.runPromise(pullEffect);

	return c.json(pullResponse, 200);
});

app.post("/push/:spaceID", async (c) => {
	// 1: PARSE INPUT
	const auth = getAuth(c);
	const db = c.get("db" as never) as Db;
	const spaceID = SpaceIDSchema.parse(c.req.param("spaceID"));
	const body = pushRequestSchema.parse(await c.req.json());

	// 2: PULL
	const pushEffect = push({
		body,
		db,
		spaceID,
		authID: auth?.userId,
		partyKitOrigin: c.env.PARTYKIT_ORIGIN,
	})
		.pipe(
			Effect.provideService(Cloudflare, {
				KV: c.env.KV,
				R2: c.env.BUCKET,
				countryCode: c.req.raw.headers.get("CF-IPCountry"),
			}),
		)
		.pipe(Effect.orDie);

	// 3: RUN PROMISE
	await Effect.runPromise(pushEffect);

	return c.json({}, 200);
});

app.post("/create-user", async (c) => {
	const db = c.get("db" as never) as Db;
	const auth = getAuth(c);

	if (!auth?.userId) {
		return c.json(
			{
				type: "ERROR",
				message: "You are not logged in.",
			},
			401,
		);
	}
	const { countryCode, storeID, user } = CreateUserSchema.parse(
		await c.req.json(),
	);

	const createUserEffect = createUser({
		countryCode,
		storeID,
		user,
	}).pipe(
		Effect.catchAll(() => {
			return Effect.succeed({
				type: "ERROR",
				message: "User already exist",
				status: 400 as const,
			});
		}),
	);

	const createUserResult = await Effect.runPromise(
		Effect.provideService(createUserEffect, Database, { manager: db }),
	);

	return c.json(
		{ type: createUserResult.type, message: createUserResult.message },
		createUserResult.status,
	);
});

app.options("/upload-file/:key", async (c) => {
	const auth = getAuth(c);
	if (!auth?.userId) return c.text("Unauthorized", 401);
	return c.json({}, 200);
});

app.post("/upload-file/:key", async (c) => {
	const auth = getAuth(c);
	if (!auth?.userId) return c.text("Unauthorized", 401);
	const key = c.req.param("key");

	const effect = Effect.tryPromise(() =>
		c.env.BUCKET.put(`images/${key}`, c.req.raw.body, {
			httpMetadata: {
				contentType: c.req.header("content-type"),
			},
		}),
	).pipe(Effect.retry({ times: 3 }));
	await Effect.runPromise(effect);

	await Promise.all([
		fetch(`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(["store"]),
		}),
		fetch(`${c.env.PARTYKIT_ORIGIN}/parties/main/user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(["user"]),
		}),
	]);
	return c.text(`Uploaded successfully ${key}`, 200);
});

app.get("/images/:key", async (c) => {
	const key = c.req.param("key");

	const cacheKey = new Request(c.req.url.toString(), c.req);
	const cache = caches.default;

	let response = await cache.match(cacheKey);

	if (response) {
		console.log(`Cache hit for: ${c.req.url}.`);
		return new Response(response.body, response);
	}

	const object = await c.env.BUCKET.get(`images/${key}`);

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

app.get("/user", async (c) => {
	const db = c.get("db" as never) as Db;

	const auth = getAuth(c);
	if (!auth?.userId) return c.json(null, 200);
	const cachedUser = await c.env.KV.get(auth.userId);
	if (cachedUser) return c.json(JSON.parse(cachedUser), 200);
	const result = await Effect.runPromise(
		Effect.tryPromise(() =>
			db.query.users.findFirst({
				where: (users, { eq }) => eq(users.authID, auth?.userId),
			}),
		).pipe(Effect.orDie),
	);

	if (!result) return c.json(null, 200);

	await c.env.KV.put(auth.userId, JSON.stringify(result));

	return c.json(result, 200);
});

app.get("/product/:handle", async (c) => {
	const db = c.get("db" as never) as Db;
	const handle = c.req.param("handle");
	const cachedProduct = await c.env.KV.get(handle);
	if (cachedProduct) return c.json(JSON.parse(cachedProduct), 200);
	const result = await Effect.runPromise(
		Effect.tryPromise(() =>
			db.query.products.findFirst({
				where: (products, { eq }) => eq(products.handle, handle),
			}),
		).pipe(Effect.orDie),
	);

	if (!result) return c.json(null, 200);

	await c.env.KV.put(handle, JSON.stringify(result), {
		expirationTtl: 60 * 60 * 24,
	});

	return c.json(result, 200);
});

app.post("/create-cart", async (c) => {
	const db = c.get("db" as never) as Db;

	const { cartID, countryCode } = z
		.object({ cartID: z.string(), countryCode: z.string() })
		.parse(await c.req.json());
	const auth = getAuth(c);

	const createCartEffect = Effect.tryPromise(() =>
		db.transaction(async (transaction) =>
			Effect.gen(function* (_) {
				yield* Effect.tryPromise(() =>
					transaction.insert(schema.carts).values({
						id: cartID,
						countryCode,
						createdAt: new Date().toISOString(),
						replicachePK: generateReplicachePK({ prefix: "cart", id: cartID }),
						...(auth?.userId && { userID: auth.userId }),
					}),
				).pipe(Effect.orDie);
				const addressID = generateID({ prefix: "address" });
				const [shippingAddress] = yield* Effect.tryPromise(() =>
					transaction
						.insert(schema.addresses)
						.values({
							countryCode,
							createdAt: new Date().toISOString(),
							replicachePK: addressID,
							id: addressID,
						})
						.returning({ id: schema.addresses.id }),
				).pipe(Effect.orDie);
				yield* Effect.tryPromise(() =>
					transaction
						.update(schema.carts)
						.set({
							shippingAddressID: shippingAddress!.id,
						})
						.where(eq(schema.carts.id, cartID)),
				).pipe(Effect.orDie);
			}),
		),
	).pipe(Effect.flatMap((result) => result));

	await Effect.runPromise(createCartEffect);
	return c.json({}, 200);
});

app.post("/complete-cart", async (c) => {
	const db = c.get("db" as never) as Db;
	const { id, checkoutInfo } = z
		.object({ checkoutInfo: CheckoutFormSchema, id: z.string() })
		.parse(await c.req.json());

	const createOrderEffect = Effect.tryPromise(() =>
		db.transaction(async (transaction) =>
			Effect.gen(function* (_) {
				const [cart, existingUser] = yield* Effect.all([
					Effect.tryPromise(() =>
						transaction.query.carts.findFirst({
							where: (carts, { eq }) => eq(carts.id, id),
							with: {
								items: true,
							},
						}),
					).pipe(Effect.orDie),

					Effect.tryPromise(() =>
						transaction.query.users.findFirst({
							where: (users, { eq }) => eq(users.email, checkoutInfo.email),
							columns: {
								id: true,
							},
						}),
					).pipe(Effect.orDie),
				]);
				if (!cart) {
					return c.text("Cart not found", 404);
				}
				if (!cart.items || cart.items.length === 0) {
					return c.text("Cart is empty", 400);
				}

				const newUserID = generateID({ prefix: "user" });
				if (!existingUser) {
					yield* Effect.tryPromise(() =>
						transaction.insert(schema.users).values({
							id: newUserID,
							replicachePK: newUserID,
							createdAt: new Date().toISOString(),
							version: 0,
							email: checkoutInfo.email,
							fullName: checkoutInfo.fullName,
						}),
					);
				}
				const storeIDToLineItem = new Map<string, LineItem[]>();
				for (const lineItem of cart.items ?? []) {
					const storeID = lineItem.storeID;
					const lineItems = storeIDToLineItem.get(storeID) ?? [];
					lineItems.push(lineItem);
					storeIDToLineItem.set(storeID, lineItems);
				}

				const storeIDToOrder = new Map<string, InsertOrder>();
				for (const [storeID, lineItems] of storeIDToLineItem.entries()) {
					const subtotal = cartSubtotal(lineItems, cart);
					//TODO: DO ACTUAL MATH ON TOTAL AND SUBTOTAL
					const orderID = generateID({ prefix: "order" });
					const newOrder: InsertOrder = {
						id: orderID,
						countryCode: cart.countryCode ?? "AU",
						currencyCode: "AUD",
						createdAt: new Date().toISOString(),
						replicachePK: generateReplicachePK({
							id: orderID,
							filterID: existingUser?.id ?? newUserID,
							prefix: "order",
						}),
						email: checkoutInfo.email ?? "email not provided",
						billingAddressID: cart.billingAddressID,
						shippingAddressID: cart.shippingAddressID,
						phone: checkoutInfo.phone,
						fullName: checkoutInfo.fullName,
						...(cart.userID
							? { userID: cart.userID }
							: { userID: existingUser ? existingUser.id : newUserID }),
						storeID,
						total: subtotal,
						status: "pending",
					};
					storeIDToOrder.set(storeID, newOrder);
				}

				const orderIDs = yield* Effect.tryPromise(() =>
					transaction
						.insert(schema.orders)
						.values(Array.from(storeIDToOrder.values()))
						.returning({ id: schema.orders.id }),
				);
				yield* Effect.all(
					[
						Effect.forEach(
							Array.from(storeIDToLineItem.entries()),
							([storeID, items]) =>
								Effect.gen(function* () {
									const effect = Effect.forEach(
										items,
										(item) => {
											return Effect.tryPromise(() =>
												transaction.update(schema.lineItems).set({
													cartID: null,
													replicachePK: generateReplicachePK({
														id: item.id,
														filterID: storeIDToOrder.get(storeID)!.id,
														prefix: "line_item",
													}),
													orderID: storeIDToOrder.get(storeID)!.id,
												}),
											);
										},
										{ concurrency: "unbounded" },
									);
									return yield* effect;
								}),
							{ concurrency: "unbounded" },
						),
						Effect.tryPromise(() =>
							transaction
								.update(schema.carts)
								.set({
									fullName: cart.fullName,
									email: cart.email,
									phone: cart.phone,
									version: sql`${schema.carts.version} + 1`,
									...(!cart.userID && {
										userID: existingUser ? existingUser.id : newUserID,
									}),
								})
								.where(eq(schema.carts.id, id)),
						),
						Effect.tryPromise(() =>
							transaction
								.update(schema.addresses)
								.set({
									address: checkoutInfo.shippingAddress.address,
									city: checkoutInfo.shippingAddress.city,
									countryCode: checkoutInfo.shippingAddress.countryCode,
									postalCode: checkoutInfo.shippingAddress.postalCode,
									province: checkoutInfo.shippingAddress.province,
									version: sql`${schema.addresses.version} + 1`,
								})
								.where(eq(schema.addresses.id, cart.shippingAddressID!)),
						).pipe(Effect.orDie),
					],
					{ concurrency: 3 },
				).pipe(Effect.orDie);
				return orderIDs.map((order) => order.id);
			}),
		),
	)
		.pipe(Effect.flatMap((result) => result))
		.pipe(Effect.orDie);

	const orderIDs = await Effect.runPromise(createOrderEffect);
	//TODO:
	await Promise.all([
		fetch(`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(["store"]),
		}),
		fetch(`${c.env.PARTYKIT_ORIGIN}/parties/main/user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(["cart", "orders"]),
		}),
	]);
	return c.json(orderIDs, 200);
});
app.get("/order", async (c) => {
	const db = c.get("db" as never) as Db;
	const ids = c.req.queries("id");

	if (!ids) return c.json(null, 200);

	const result = await Effect.runPromise(
		Effect.tryPromise(() =>
			db.query.orders.findMany({
				where: (orders, { inArray }) => inArray(orders.id, ids),
				with: {
					items: true,
				},
			}),
		).pipe(Effect.orDie),
	);

	if (!result) return c.json(null, 200);

	return c.json(result, 200);
});
app.get("/hello", (c) => {
	return c.text("hello");
});

export default app;
