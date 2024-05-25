import * as Http from "@effect/platform/HttpClient";
import { getAuth } from "@hono/clerk-auth";
import { ErrorService } from "@blazell/api";
import { schema, tableNameToTableMap, type Db } from "@blazell/db";
import { Database } from "@blazell/shared";
import { cartSubtotal, generateID, generateReplicachePK } from "@blazell/utils";
import {
	CartError,
	CheckoutFormSchema,
	NeonDatabaseError,
	type Bindings,
	type InsertOrder,
} from "@blazell/validators";
import { eq, sql } from "drizzle-orm";
import { Effect } from "effect";
import { Hono } from "hono";
import { z } from "zod";
const app = new Hono<{ Bindings: Bindings }>();
app.post("/create-cart", async (c) => {
	const db = c.get("db" as never) as Db;

	const { cartID, countryCode } = z
		.object({ cartID: z.string(), countryCode: z.string() })
		.parse(await c.req.json());
	const auth = getAuth(c);

	const createCartEffect = Effect.tryPromise(() =>
		db.transaction(
			async (transaction) =>
				Effect.gen(function* (_) {
					yield* Effect.tryPromise(() =>
						transaction.insert(schema.carts).values({
							id: cartID,
							countryCode,
							createdAt: new Date().toISOString(),
							replicachePK: generateReplicachePK({
								prefix: "cart",
								id: cartID,
							}),
							...(auth?.userId && { userID: auth.userId }),
						}),
					);
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
					);
					yield* Effect.tryPromise(() =>
						transaction
							.update(schema.carts)
							.set({
								shippingAddressID: shippingAddress!.id,
							})
							.where(eq(schema.carts.id, cartID)),
					);
				}).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				),
			{ accessMode: "read write", isolationLevel: "read committed" },
		),
	).pipe(
		Effect.flatMap((result) => result),
		Effect.orDie,
	);

	await Effect.runPromise(createCartEffect);
	return c.json({}, 200);
});

//TODO: Create a workflow for completing a cart. Wait until Effect/cluster
app.post("/complete-cart", async (c) => {
	const db = c.get("db" as never) as Db;
	const { id, checkoutInfo } = z
		.object({ checkoutInfo: CheckoutFormSchema, id: z.string() })
		.parse(await c.req.json());

	const createOrderEffect = Effect.tryPromise(() =>
		db.transaction(
			async (transaction) =>
				Effect.gen(function* () {
					const [cart, existingUser] = yield* Effect.all([
						Effect.tryPromise(() =>
							transaction.query.carts.findFirst({
								where: (carts, { eq }) => eq(carts.id, id),
								with: {
									items: {
										with: {
											variant: {
												with: {
													prices: true,
												},
											},
										},
									},
								},
							}),
						),

						Effect.tryPromise(() =>
							transaction.query.users.findFirst({
								where: (users, { eq }) => eq(users.email, checkoutInfo.email),
								columns: {
									id: true,
								},
							}),
						),
					]);
					if (!cart) {
						return yield* Effect.fail(
							new CartError({ message: "Cart not found." }),
						);
					}
					if (!cart.items || cart.items.length === 0) {
						return yield* Effect.fail(
							new CartError({ message: "Cart is empty." }),
						);
					}

					const newUserID = generateID({ prefix: "user" });

					/* create new user if not found */
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

					/* items can be from many stores. Map them */
					const storeIDToLineItem = new Map<string, typeof cart.items>();
					yield* Effect.forEach(cart.items ?? [], (lineItem) =>
						Effect.sync(() => {
							const storeID = lineItem.storeID;
							const lineItems = storeIDToLineItem.get(storeID) ?? [];
							lineItems.push(lineItem);
							storeIDToLineItem.set(storeID, lineItems);
						}),
					);

					const storeIDToOrder = new Map<string, InsertOrder>();

					/* Create an order for each store. */
					yield* Effect.forEach(
						storeIDToLineItem.entries(),
						([storeID, lineItems]) =>
							Effect.gen(function* () {
								//TODO: DO ACTUAL MATH ON TOTAL AND SUBTOTAL
								const subtotal = yield* cartSubtotal(lineItems, cart);
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
							}),
					);

					/* Get order IDs a. */
					const orderIDs = yield* Effect.tryPromise(() =>
						transaction
							.insert(schema.orders)
							//@ts-ignore
							.values(Array.from(storeIDToOrder.values()))
							.returning({ id: schema.orders.id }),
					);
					yield* Effect.all(
						[
							/* for each line item, update the orderID, so that order will include those items */
							/* for each line item, remove the cartID, so that cart will not include items that were successfully ordered */
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

							/* save user info for the cart */
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

							/* save address info for the cart */
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
							),
						],
						{ concurrency: 3 },
					);
					return orderIDs.map((order) => order.id);
				}).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				),
			{ accessMode: "read write", isolationLevel: "read committed" },
		),
	).pipe(
		Effect.flatMap((result) => result),
		Effect.withSpan("complete-cart"),
		Effect.catchTags({
			CartError: (error) =>
				ErrorService.CreateClientError({
					title: "Cart error",
					message: error.message,
					partyKitOrigin: c.env.PARTYKIT_ORIGIN,
					userID: c.req.header("x-user-id") ?? c.req.header("x-global-id"),
				}),
			PriceNotFound: (error) =>
				ErrorService.CreateClientError({
					title: "Price not found",
					message: error.message,
					partyKitOrigin: c.env.PARTYKIT_ORIGIN,
					userID: c.req.header("x-user-id") ?? c.req.header("x-global-id"),
				}),
		}),

		Effect.provideService(
			Database,
			Database.of({
				manager: db,
				tableNameToTableMap,
			}),
		),
		Effect.orDie,
		Effect.retry({ times: 2 }),
		Effect.zipLeft(
			Effect.all([
				Http.request
					.post(`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`)
					.pipe(
						Http.request.jsonBody(["store"]),
						Effect.andThen(Http.client.fetch),
						Effect.retry({ times: 3 }),
						Effect.scoped,
					),
				Http.request
					.post(`${c.env.PARTYKIT_ORIGIN}/parties/main/user`)
					.pipe(
						Http.request.jsonBody(["cart", "orders"]),
						Effect.andThen(Http.client.fetch),
						Effect.retry({ times: 3 }),
						Effect.scoped,
					),
			]),
		),
	);

	const orderIDs = await Effect.runPromise(createOrderEffect);
	if (!orderIDs) return c.json({}, 400);

	return c.json(orderIDs, 200);
});

export default app;
