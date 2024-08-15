import { ErrorService } from "@blazell/api";
import { schema, tableNameToTableMap } from "@blazell/db";
import { Database } from "@blazell/shared";
import { cartSubtotal, generateID } from "@blazell/utils";
import {
	CartError,
	CheckoutFormSchema,
	NeonDatabaseError,
	type Auth,
	type Bindings,
	type Env,
	type InsertOrder,
} from "@blazell/validators";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { eq, sql } from "drizzle-orm";
import { Console, Effect } from "effect";
import { Hono } from "hono";
import { getDB } from "server/lib/db";
import { z } from "zod";
const app = new Hono<{ Bindings: Bindings & Env }>()
	.post("/create-cart", async (c) => {
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const auth = c.get("auth" as never) as Auth;

		const { cartID, countryCode } = z
			.object({ cartID: z.string(), countryCode: z.string() })
			.parse(await c.req.json());

		const createCartEffect = Effect.tryPromise(() =>
			db.transaction(
				async (transaction) =>
					Effect.gen(function* (_) {
						yield* Effect.tryPromise(() =>
							transaction.insert(schema.carts).values({
								id: cartID,
								countryCode,
								createdAt: new Date().toISOString(),
								currencyCode: "AUD",
								...(auth?.user?.id && { userID: auth.user.id }),
							}),
						);
						const [shippingAddress] = yield* Effect.tryPromise(() =>
							transaction
								.insert(schema.addresses)
								.values({
									countryCode,
									createdAt: new Date().toISOString(),
									id: generateID({ prefix: "address" }),
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
	})
	.post("/complete-cart", async (c) => {
		//TODO: Create a workflow for completing a cart. Wait until Effect/cluster
		const db = getDB({ connectionString: c.env.DATABASE_URL });
		const body = await c.req.json();
		const { id, checkoutInfo } = z
			.object({ checkoutInfo: CheckoutFormSchema, id: z.string() })
			.parse(body);

		const orderIDs = await Effect.runPromise(
			Effect.tryPromise(() =>
				db.transaction(
					async (transaction) =>
						Effect.gen(function* () {
							const [cart, existingCustomer, existingUser] = yield* Effect.all(
								[
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
										transaction.query.customers.findFirst({
											where: (customers, { eq }) =>
												eq(customers.email, checkoutInfo.email),
											columns: {
												id: true,
											},
										}),
									),
									Effect.tryPromise(() =>
										transaction.query.users.findFirst({
											where: (users, { eq }) =>
												eq(users.email, checkoutInfo.email),
											columns: {
												id: true,
											},
										}),
									),
								],
								{ concurrency: 3 },
							);
							yield* Console.log("CAAART", cart);
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

							const newCustomerID = generateID({ prefix: "customer" });
							const newUserID = generateID({ prefix: "user" });
							const newShippingAddressID = generateID({ prefix: "address" });

							/* create new user if not found */
							if (!existingCustomer) {
								yield* Effect.all([
									!existingCustomer
										? Effect.tryPromise(() =>
												transaction.insert(schema.customers).values({
													id: newCustomerID,
													createdAt: new Date().toISOString(),
													version: 0,
													email: checkoutInfo.email,
													userID: existingUser ? existingUser.id : newUserID,
												}),
											)
										: Effect.succeed({}),
									!existingUser
										? Effect.tryPromise(() =>
												transaction.insert(schema.users).values({
													id: newUserID,
													createdAt: new Date().toISOString(),
													version: 0,
													fullName: checkoutInfo.fullName,
													email: checkoutInfo.email,
												}),
											)
										: Effect.succeed({}),
								]);
							}

							/* create new address*/
							if (!cart.shippingAddressID) {
								yield* Effect.tryPromise(() =>
									transaction.insert(schema.addresses).values({
										id: newShippingAddressID,
										address: checkoutInfo.shippingAddress.address,
										city: checkoutInfo.shippingAddress.city,
										countryCode: checkoutInfo.shippingAddress.countryCode,
										postalCode: checkoutInfo.shippingAddress.postalCode,
										province: checkoutInfo.shippingAddress.province,
										version: 0,
										createdAt: new Date().toISOString(),
										userID: existingUser ? existingUser.id : newUserID,
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
										const newOrder: InsertOrder = {
											id: generateID({ prefix: "order" }),
											countryCode: cart.countryCode ?? "AU",
											currencyCode: "AUD",
											createdAt: new Date().toISOString(),
											email: checkoutInfo.email ?? "email not provided",
											//TODO
											billingAddressID:
												cart.shippingAddressID ?? newShippingAddressID,
											shippingAddressID:
												cart.shippingAddressID ?? newShippingAddressID,
											phone: checkoutInfo.phone,
											fullName: checkoutInfo.fullName,
											customerID: existingCustomer
												? existingCustomer.id
												: newCustomerID,
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
							yield* Effect.all([
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
														transaction
															.update(schema.lineItems)
															.set({
																cartID: null,
																orderID: storeIDToOrder.get(storeID)!.id,
															})
															.where(eq(schema.lineItems.id, item.id)),
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
											userID: existingUser ? existingUser.id : newUserID,
											...(!cart.shippingAddressID && {
												shippingAddressID: newShippingAddressID,
											}),
										})

										.where(eq(schema.carts.id, id)),
								),

								Effect.tryPromise(() =>
									transaction.insert(schema.notifications).values([
										{
											id: generateID({ prefix: "notification" }),
											createdAt: new Date().toISOString(),
											type: "ORDER_PLACED" as const,
											entityID: existingUser ? existingUser.id : newUserID,
											description: "Order has been placed",
											title: "Order Placed",
										},
										...Array.from(storeIDToOrder.keys()).map((storeID) => ({
											id: generateID({ prefix: "notification" }),
											createdAt: new Date().toISOString(),
											type: "ORDER_PLACED" as const,
											entityID: storeID,
											description: "Order has been placed",
											title: "Order Placed",
										})),
									]),
								),
							]);
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
					UnknownException: (error) =>
						Effect.gen(function* () {
							yield* Console.error(
								"Unknown blyat",
								error.message,
								error.toString(),
							);
							yield* ErrorService.CreateClientError({
								title: "Something wrong happened",
								message: error.message,
								partyKitOrigin: c.env.PARTYKIT_ORIGIN,
								userID:
									c.req.header("x-user-id") ?? c.req.header("x-global-id"),
							});
							return [];
						}),
					CartError: (error) =>
						Effect.gen(function* () {
							yield* Console.error(
								"Cart error",
								error.message,
								error.toString(),
							);

							yield* ErrorService.CreateClientError({
								title: "Cart error",
								message: error.message,
								partyKitOrigin: c.env.PARTYKIT_ORIGIN,
								userID:
									c.req.header("x-user-id") ?? c.req.header("x-global-id"),
							});
							return [];
						}),
					PriceNotFound: (error) =>
						Effect.gen(function* () {
							yield* Console.error(
								"Price not found",
								error.message,
								error.toString(),
							);

							yield* ErrorService.CreateClientError({
								title: "Price not found",
								message: error.message,
								partyKitOrigin: c.env.PARTYKIT_ORIGIN,
								userID:
									c.req.header("x-user-id") ?? c.req.header("x-global-id"),
							});
							return [];
						}),
				}),

				Effect.provideService(
					Database,
					Database.of({
						manager: db,
						tableNameToTableMap,
					}),
				),
				Effect.retry({ times: 2 }),
				Effect.zipLeft(
					Effect.all([
						HttpClientRequest.post(
							`${c.env.PARTYKIT_ORIGIN}/parties/main/dashboard`,
						).pipe(
							HttpClientRequest.jsonBody(["store"]),
							Effect.andThen(HttpClient.fetch),
							Effect.retry({ times: 3 }),
							Effect.scoped,
							//TODO: Handle errors
							Effect.orDie,
						),
						HttpClientRequest.post(
							`${c.env.PARTYKIT_ORIGIN}/parties/main/global`,
						).pipe(
							HttpClientRequest.jsonBody(["cart", "orders", "notifications"]),
							Effect.andThen(HttpClient.fetch),
							Effect.retry({ times: 3 }),
							Effect.scoped,
							//TODO: Handle errors
						),
					]),
				),

				Effect.orDie,
			),
		);

		if (!orderIDs) return c.json({}, 400);

		return c.json(orderIDs, 200);
	});

export default app;
