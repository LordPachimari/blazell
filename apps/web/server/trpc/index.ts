import { AuthService, ErrorService, UserService } from "@blazell/api";
import { verifyOTP } from "@blazell/api/src/services/auth";
import { schema, tableNameToTableMap } from "@blazell/db";
import { AuthContext, Cloudflare, Database } from "@blazell/shared";
import { cartSubtotal, generateID } from "@blazell/utils";
import {
	CartError,
	CheckoutFormSchema,
	NeonDatabaseError,
	PrepareVerificationSchema,
	type AuthUser,
	type Env,
	type GoogleProfile,
	type InsertAuth,
	type InsertOrder,
} from "@blazell/validators";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { initTRPC } from "@trpc/server";
import { generateCodeVerifier, generateState, Google } from "arctic";
import { eq, lte, sql } from "drizzle-orm";
import { Console, Effect } from "effect";
import { createDate, TimeSpan } from "oslo";
import { getDB } from "server/lib/db";
import { z } from "zod";
export type TRPCContext = {
	env: Env;
	request: Request;
	authUser: AuthUser | null;
	bindings: {
		KV: KVNamespace;
	};
};
const t = initTRPC.context<TRPCContext>().create();

export const procedure = t.procedure;
export const router = t.router;
const createCallerFactory = t.createCallerFactory;

const helloRouter = router({
	hello: procedure.query(() => {
		return "hello from trpc";
	}),
});
const authRouter = router({
	userAndSession: procedure
		.input(z.object({ sessionID: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { sessionID } = input;
			const session = await db.query.sessions.findFirst({
				where: (sessions, { eq }) => eq(sessions.id, sessionID),
				with: {
					user: true,
				},
			});
			return { user: session?.user, session };
		}),
	createSession: procedure
		.input(z.object({ authID: z.string(), expiresAt: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { authID, expiresAt } = input;
			const session = {
				id: generateID({ prefix: "session" }),
				authID,
				createdAt: new Date().toISOString(),
				expiresAt,
			};
			await db.insert(schema.sessions).values(session).returning();
			return session;
		}),
	deleteSession: procedure
		.input(z.object({ sessionID: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { sessionID } = input;
			await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionID));
			return sessionID;
		}),
	deleteExpiredSessions: procedure.mutation(async ({ ctx }) => {
		const db = getDB({ connectionString: ctx.env.DATABASE_URL });
		await db
			.delete(schema.sessions)
			.where(lte(schema.sessions.expiresAt, new Date().toISOString()));
	}),
	prepareVerification: procedure
		.input(PrepareVerificationSchema)
		.query(async ({ ctx, input }) => {
			const { env, request, bindings } = ctx;
			const { email, redirectTo } = input;
			const db = getDB({ connectionString: env.DATABASE_URL });

			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
				columns: {
					id: true,
				},
			});

			const { emailVerifyURL, otp } = await Effect.runPromise(
				AuthService.prepareVerification({
					target: email,
					...(!user
						? {
								redirectTo: `${new URL(request.url).origin}/onboarding`,
							}
						: redirectTo && { redirectTo }),
				}).pipe(
					Effect.provideService(Database, { manager: db }),
					Effect.provideService(
						Cloudflare,
						Cloudflare.of({
							env,
							request,
							bindings: {
								KV: bindings.KV,
							},
						}),
					),
				),
			);
			console.log("Generated OTP", otp);
			console.log("server url", `${env.SERVER_URL}/emails/verify-otp`);

			const { status } = await Effect.runPromise(
				HttpClientRequest.post(`${env.SERVER_URL}/emails/verify-otp`).pipe(
					HttpClientRequest.jsonBody({
						otp,
						email,
						emailVerifyURL: emailVerifyURL.toString(),
					}),
					Effect.andThen(HttpClient.fetchOk),
					Effect.scoped,
					Effect.catchAll((error) =>
						Effect.sync(() => {
							console.error(error.toString());
							return {
								status: "error" as const,
								message: "Failed to send email",
							};
						}),
					),
				),
			);
			if (status === "error") {
				return { status: "error" as const, message: "Failed to send email" };
			}

			return { status: "success" as const };
		}),
	verifyOTP: procedure
		.input(z.object({ otp: z.string(), target: z.string() }))
		.query(async ({ ctx, input }) => {
			const { env } = ctx;
			const db = getDB({ connectionString: env.DATABASE_URL });
			const { otp, target } = input;
			const validationResult = await Effect.runPromise(
				verifyOTP({ otp, target }).pipe(
					Effect.provideService(Database, { manager: db }),
				),
			);

			if (!validationResult) {
				return {
					valid: false,
				};
			}

			let authUser: InsertAuth | undefined | AuthUser =
				await db.query.authUsers.findFirst({
					where: (authUsers, { eq }) => eq(authUsers.email, target),
				});

			if (!authUser) {
				const newUser = {
					id: generateID({ prefix: "user" }),
					email: target,
					createdAt: new Date().toISOString(),
					version: 1,
				};
				await db.insert(schema.authUsers).values(newUser).onConflictDoNothing();
				authUser = newUser;
			}

			const sessionExpiresIn = new TimeSpan(30, "d");
			const expiresAt = createDate(sessionExpiresIn).toISOString();
			const session = {
				id: generateID({ prefix: "session" }),
				authID: authUser.id,
				createdAt: new Date().toISOString(),
				expiresAt,
			};
			await db.insert(schema.sessions).values(session).returning();
			return {
				valid: true,
				onboard: !authUser.username,
				session,
			};
		}),
	google: procedure.query(async ({ ctx }) => {
		const { request, env } = ctx;
		const url = new URL(request.url);
		const origin = url.origin;
		const google = new Google(
			env.GOOGLE_CLIENT_ID,
			env.GOOGLE_CLIENT_SECRET,
			`${origin}/google/callback`,
		);
		const state = generateState();
		const codeVerifier = generateCodeVerifier();

		try {
			const googleURL = await google.createAuthorizationURL(
				state,
				codeVerifier,
				{
					scopes: ["openid", "email", "profile"],
				},
			);

			return {
				status: "success",
				state,
				codeVerifier,
				url: googleURL.toString(),
			};
		} catch (error) {
			console.error(error);
			return {
				status: "error",
			};
		}
	}),

	googleCallback: procedure
		.input(
			z.object({
				code: z.string(),
				codeVerifier: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const url = new URL(ctx.request.url);
			const origin = url.origin;

			const { code, codeVerifier } = input;

			try {
				const google = new Google(
					ctx.env.GOOGLE_CLIENT_ID,
					ctx.env.GOOGLE_CLIENT_SECRET,
					`${origin}/google/callback`,
				);
				const tokens = await google.validateAuthorizationCode(
					code,
					codeVerifier,
				);
				const googleUserResponse = await fetch(
					"https://www.googleapis.com/oauth2/v3/userinfo",
					{
						headers: {
							Authorization: `Bearer ${tokens.accessToken}`,
						},
					},
				);
				const googleUserResult: GoogleProfile = await googleUserResponse.json();
				let onboard = false;

				let authUser = await db.query.authUsers.findFirst({
					where: (authUsers, { eq, or }) =>
						or(
							eq(authUsers.googleID, googleUserResult.sub),
							eq(authUsers.email, googleUserResult.email),
						),
				});

				if (!authUser) {
					onboard = true;
					const [newAuthUser] = await db
						.insert(schema.authUsers)
						.values({
							id: generateID({ prefix: "user" }),
							googleID: googleUserResult.sub,
							email: googleUserResult.email,
							...(googleUserResult.picture && {
								avatar: googleUserResult.picture,
							}),
							...(googleUserResult.name && { fullName: googleUserResult.name }),
							createdAt: new Date().toISOString(),
							version: 1,
						})
						.returning();
					if (newAuthUser) {
						authUser = newAuthUser;
					} else {
						return {
							status: "error" as const,
							message: "Failed to create user",
						};
					}
				}

				const sessionExpiresIn = new TimeSpan(30, "d");
				const expiresAt = createDate(sessionExpiresIn).toISOString();
				const session = {
					id: generateID({ prefix: "session" }),
					authID: authUser.id,
					createdAt: new Date().toISOString(),
					expiresAt,
				};
				await db.insert(schema.sessions).values(session).returning();
				return {
					status: "success" as const,
					onboard,
					session,
				};
			} catch (error) {
				console.error(error);
				return {
					status: "error" as const,
					message: "Failed to authenticate user",
				};
			}
		}),
});
const userRouter = router({
	id: procedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { id } = input;
			const result = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, id),
			});

			return result ?? null;
		}),
	username: procedure
		.input(z.object({ username: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { username } = input;
			const result = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username),
			});

			return result ?? null;
		}),
	email: procedure
		.input(z.object({ email: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { email } = input;
			const result = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, email),
			});

			return result ?? null;
		}),
	onboard: procedure
		.input(z.object({ username: z.string(), countryCode: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { username, countryCode } = input;
			const auth = ctx.authUser;
			if (!auth) {
				return { status: "error" as const, message: "Unauthorized" };
			}

			const result = await Effect.runPromise(
				Effect.gen(function* () {
					const onboard = yield* Effect.tryPromise(() =>
						db.transaction(async (tx) =>
							UserService.onboardUser({
								countryCode,
								username,
							}).pipe(
								Effect.provideService(Database, Database.of({ manager: tx })),
								Effect.provideService(
									AuthContext,
									AuthContext.of({ authUser: auth }),
								),
							),
						),
					).pipe(
						Effect.map(() => ({ status: "success" as const })),
						Effect.retry({ times: 3 }),
						Effect.catchAll((e) =>
							Effect.gen(function* () {
								yield* Console.log(e.message);
								return {
									status: "error" as const,
									message: "Error onboarding users.",
								};
							}),
						),
						Effect.zipLeft(
							Effect.all([
								HttpClientRequest.post(
									`${ctx.env.PARTYKIT_ORIGIN}/parties/main/dashboard`,
								).pipe(
									HttpClientRequest.jsonBody(["store"]),
									Effect.andThen(HttpClient.fetch),
									Effect.retry({ times: 3 }),
									Effect.scoped,
								),
								HttpClientRequest.post(
									`${ctx.env.PARTYKIT_ORIGIN}/parties/main/global`,
								).pipe(
									HttpClientRequest.jsonBody(["user"]),
									Effect.andThen(HttpClient.fetch),
									Effect.retry({ times: 3 }),
									Effect.scoped,
								),
							]).pipe(
								Effect.catchAll((e) =>
									Effect.sync(() => {
										console.error(e);
									}),
								),
							),
						),
					);
					return onboard;
				}),
			);

			return result;
		}),
});

const cartRouter = router({
	createCart: procedure
		.input(z.object({ cartID: z.string(), countryCode: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { authUser } = ctx;
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { cartID, countryCode } = input;
			const createCartEffect = Effect.tryPromise(() =>
				db.transaction(
					async (transaction) =>
						Effect.gen(function* () {
							yield* Effect.tryPromise(() =>
								transaction.insert(schema.carts).values({
									id: cartID,
									countryCode,
									createdAt: new Date().toISOString(),
									currencyCode: "AUD",
									...(authUser?.id && { userID: authUser.id }),
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
		}),
	completeCart: procedure
		.input(z.object({ checkoutInfo: CheckoutFormSchema, id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { checkoutInfo, id } = input;
			const orderIDs = await Effect.runPromise(
				Effect.tryPromise(() =>
					db.transaction(
						async (transaction) =>
							Effect.gen(function* () {
								const [cart, existingCustomer, existingUser] =
									yield* Effect.all(
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
									partyKitOrigin: ctx.env.PARTYKIT_ORIGIN,
									userID:
										ctx.request.headers.get("x-user-id") ??
										ctx.request.headers.get("x-global-id"),
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
									partyKitOrigin: ctx.env.PARTYKIT_ORIGIN,
									userID:
										ctx.request.headers.get("x-user-id") ??
										ctx.request.headers.get("x-global-id"),
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
									partyKitOrigin: ctx.env.PARTYKIT_ORIGIN,
									userID:
										ctx.request.headers.get("x-user-id") ??
										ctx.request.headers.get("x-global-id"),
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
								`${ctx.env.PARTYKIT_ORIGIN}/parties/main/dashboard`,
							).pipe(
								HttpClientRequest.jsonBody(["store"]),
								Effect.andThen(HttpClient.fetch),
								Effect.retry({ times: 3 }),
								Effect.scoped,
								//TODO: Handle errors
								Effect.orDie,
							),
							HttpClientRequest.post(
								`${ctx.env.PARTYKIT_ORIGIN}/parties/main/global`,
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

			if (!orderIDs) return [];

			return orderIDs;
		}),
});
const orderRouter = router({
	getByIDs: procedure
		.input(z.object({ ids: z.array(z.string()) }))
		.query(async ({ ctx, input }) => {
			const { ids } = input;
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			if (ids.length === 0) return [];

			const result = await Effect.runPromise(
				Effect.tryPromise(() =>
					db.query.orders.findMany({
						where: (orders, { inArray }) => inArray(orders.id, ids),
						with: {
							items: {
								with: {
									variant: {
										with: {
											optionValues: {
												with: {
													optionValue: {
														with: {
															option: true,
														},
													},
												},
											},
											prices: true,
										},
									},
									product: true,
								},
							},
							shippingAddress: true,
							billingAddress: true,
							store: {
								columns: {
									id: true,
									storeImage: true,
									name: true,
								},
							},
						},
					}),
				).pipe(Effect.orDie),
			);

			if (!result) return [];

			return result;
		}),
});
const productRouter = router({
	handle: procedure
		.input(z.object({ handle: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { handle } = input;
			const variant = await db.query.variants.findFirst({
				where: (variants, { eq }) => eq(variants.handle, handle),
				with: {
					prices: true,
					optionValues: {
						with: {
							optionValue: true,
						},
					},
				},
			});
			if (!variant) {
				return null;
			}
			const product = await db.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, variant.productID),
				with: {
					options: {
						with: {
							optionValues: true,
						},
					},
					store: true,
				},
			});

			return {
				...product,
				defaultVariant: variant,
			};
		}),
});

const storeRouter = router({
	name: procedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { name } = input;
			const result = await db.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.name, name),
				with: {
					owner: true,
					products: true,
				},
			});

			if (!result) {
				return null;
			}

			return result;
		}),
	update: procedure
		.input(z.object({ id: z.string(), name: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { authUser } = ctx;
			if (!authUser) {
				return { status: "error", message: "You are not authorized" };
			}

			const db = getDB({ connectionString: ctx.env.DATABASE_URL });
			const { id, name } = input;
			const exist = await db.query.stores.findFirst({
				where: (stores, { eq }) => eq(stores.name, name),
			});
			if (exist) {
				return { status: "error", message: "Store already exists" };
			}
			await db
				.update(schema.stores)
				.set({ name })
				.where(eq(schema.stores.id, id));
		}),
});
export const appRouter = router({
	hello: helloRouter,
	auth: authRouter,
	users: userRouter,
	carts: cartRouter,
	orders: orderRouter,
	products: productRouter,
	stores: storeRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
