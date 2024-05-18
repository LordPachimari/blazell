import { Effect, pipe } from "effect";

import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";
import type { RowsWTableName } from "@pachi/validators";

export const storeCVD: GetRowsWTableName = ({
	transaction,
	authID,
	fullRows = false,
}) => {
	return Effect.gen(function* (_) {
		if (!authID) return [];
		const rowsWTableName: RowsWTableName[] = [];
		const activeStoreIDEffect = pipe(
			Effect.tryPromise(() =>
				fullRows
					? transaction.query.jsonTable.findFirst({
							where: (jsonTable, { eq }) =>
								eq(jsonTable.id, `active_store_id_${authID}`),
						})
					: transaction.query.jsonTable.findFirst({
							where: (jsonTable, { eq }) =>
								eq(jsonTable.id, `active_store_id_${authID}`),
							columns: {
								id: true,
								version: true,
								replicachePK: true,
							},
						}),
			),
			Effect.orDieWith((e) =>
				UnknownExceptionLogger(e, "ERROR RETRIEVING PRODUCTS ROWS"),
			),
		);

		const storeDataEffect = Effect.tryPromise(() =>
			fullRows
				? transaction.query.users.findFirst({
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

											prices: true,
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
													product: {
														with: {
															prices: true,
														},
													},
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
				: transaction.query.users.findFirst({
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
			Effect.orDieWith((e) =>
				UnknownExceptionLogger(e, "ERROR RETRIEVING STORE CVD"),
			),
		);
		const [activeStoreID, storeData] = yield* _(
			Effect.all([activeStoreIDEffect, storeDataEffect], { concurrency: 2 }),
		);
		yield* _(
			Effect.sync(() =>
				rowsWTableName.push({
					tableName: "json" as const,
					rows: activeStoreID ? [activeStoreID] : [],
				}),
			),
		);
		yield* _(
			Effect.forEach(
				storeData?.stores ?? [],
				(store) => {
					return Effect.gen(function* (_) {
						yield* _(
							Effect.all(
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

									Effect.sync(() =>
										rowsWTableName.push({
											tableName: "users" as const,
											//@ts-ignore
											rows: store.orders
												.map((order) => {
													return order.user;
												})
												.filter((user) => user !== null),
										}),
									),

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
								{ concurrency: 5 },
							),
						);
					});
				},
				{ concurrency: "unbounded" },
			),
		);

		return rowsWTableName;
	});
};
