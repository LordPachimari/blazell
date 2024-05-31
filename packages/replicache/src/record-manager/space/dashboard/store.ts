import { Console, Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { NeonDatabaseError, type RowsWTableName } from "@blazell/validators";
import { Database } from "@blazell/shared";
import { ReplicacheContext } from "../../../context";

export const storeCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authID } = yield* ReplicacheContext;
		if (!authID) return [];
		const { manager } = yield* Database;
		const rowsWTableName: RowsWTableName[] = [];
		const activeStoreIDEffect = pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.jsonTable.findFirst({
							where: (jsonTable, { eq }) =>
								eq(jsonTable.id, `active_store_id_${authID}`),
						})
					: manager.query.jsonTable.findFirst({
							where: (jsonTable, { eq }) =>
								eq(jsonTable.id, `active_store_id_${authID}`),
							columns: {
								id: true,
								version: true,
								replicachePK: true,
							},
						}),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);

		const storeDataEffect = Effect.tryPromise(() =>
			fullRows
				? manager.query.users.findFirst({
						where: (user, { eq }) => eq(user.authID, authID),
						with: {
							stores: {
								with: {
									products: {
										with: {
											variants: {
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
											options: {
												with: {
													optionValues: true,
												},
											},
											defaultVariant: true,
										},
									},
									founder: true,
									orders: {
										with: {
											user: {
												columns: {
													id: true,
													fullName: true,
													email: true,
													username: true,
													phone: true,
													replicachePK: true,
												},
											},
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
										},
									},
								},
							},
						},
					})
				: manager.query.users.findFirst({
						where: (users, { eq }) => eq(users.authID, authID),
						with: {
							stores: {
								columns: {
									id: true,
									version: true,
									replicachePK: true,
								},
								with: {
									products: {
										columns: {
											id: true,
											version: true,
											replicachePK: true,
										},
										with: {
											variants: {
												columns: {
													id: true,
													version: true,
													replicachePK: true,
												},
											},
											defaultVariant: true,
										},
									},
									orders: {
										columns: {
											id: true,
											version: true,
											replicachePK: true,
										},
										with: {
											user: {
												columns: {
													id: true,
													version: true,
													replicachePK: true,
												},
											},
											items: {
												columns: {
													id: true,
													version: true,
													replicachePK: true,
												},
											},
										},
									},
								},
							},
						},
					}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		const [activeStoreID, storeData] = yield* Effect.all(
			[activeStoreIDEffect, storeDataEffect],
			{ concurrency: 2 },
		);

		yield* Effect.sync(() =>
			rowsWTableName.push({
				tableName: "json" as const,
				rows: activeStoreID ? [activeStoreID] : [],
			}),
		);

		yield* Effect.forEach(
			storeData?.stores ?? [],
			(store) => {
				return Effect.gen(function* () {
					yield* Effect.all(
						[
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "stores" as const,
									rows: [{ ...store, products: undefined }],
								}),
							),

							//push variants before products, as products.variants = [] modifies variants property
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "variants" as const,
									rows: store.products.flatMap((value) => value.variants),
								}),
							),
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "products" as const,
									rows: store.products.map((product) => {
										product.variants = [];
										return product;
									}),
								}),
							),

							Effect.sync(() => {
								const customers = store.orders
									.map((order) => {
										return order.user;
									})
									.filter((user) => user !== null);

								rowsWTableName.push({
									tableName: "users" as const,
									//@ts-ignore
									rows: customers,
								});
							}),

							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "lineItems" as const,
									rows: store.orders.flatMap((order) => order.items),
								}),
							),
							Effect.sync(() =>
								rowsWTableName.push({
									tableName: "orders" as const,
									rows: store.orders.map((o) => {
										o.items = [];
										return o;
									}),
								}),
							),
						],
						{ concurrency: 6 },
					);
				});
			},
			{ concurrency: "unbounded" },
		);
		yield* Console.log("CART CVD", JSON.stringify(rowsWTableName));

		return rowsWTableName;
	});
};
