import {
	NeonDatabaseError,
	type SpaceID,
	type SpaceRecord,
} from "@blazell/validators";

import { storeCVD } from "./dashboard";
import { userCVD } from "./global/user";
import type { GetRowsWTableName } from "./types";
import { cartCVD } from "./global/cart";
import { ordersCVD } from "./global/orders";
import { tableNameToTableMap, type TableName } from "@blazell/db";
import { Effect, pipe } from "effect";
import { generateRandomWithBias } from "@blazell/utils";
import { Database } from "@blazell/shared";
import { errorsCVD } from "./global/errors";
import { inArray } from "drizzle-orm";
import { notificationsCVD } from "./global/notifications";
import { storesCVD } from "./marketplace/stores";

export type SpaceRecordGetterType = {
	[K in SpaceID]: Record<SpaceRecord[K][number], GetRowsWTableName>;
};
export const SpaceRecordGetter: SpaceRecordGetterType = {
	dashboard: {
		store: storeCVD,
	},
	global: {
		errors: errorsCVD,
		user: userCVD,
		cart: cartCVD,
		orders: ordersCVD,
		notifications: notificationsCVD,
	},
	marketplace: {
		stores: storesCVD,
	},
};
export const fullRowsGetter = (tableName: TableName, keys: string[]) =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		if (tableName === "products") {
			const products = yield* pipe(
				Effect.tryPromise(() =>
					manager.query.products.findMany({
						where: (products, { inArray }) => inArray(products.id, keys),
						with: {
							options: {
								with: {
									optionValues: true,
								},
							},
							defaultVariant: {
								with: {
									prices: true,
								},
							},
							store: true,
						},
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);

			return products.map((product) => {
				product.score = generateRandomWithBias(1, 4, 1, 10);
				return product;
			});
		}
		if (tableName === "stores") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.stores.findMany({
						where: (stores, { inArray }) => inArray(stores.id, keys),
						with: {
							owner: true,
							products: true,
						},
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "variants") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.variants.findMany({
						where: (products, { inArray }) => inArray(products.id, keys),
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
					}),
				),

				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}

		if (tableName === "carts") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.carts.findMany({
						where: (carts, { inArray }) => inArray(carts.id, keys),
						with: {
							shippingAddress: true,
						},
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "lineItems") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.lineItems.findMany({
						where: (items, { inArray }) => inArray(items.id, keys),
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
					}),
				),

				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		if (tableName === "orders") {
			return yield* pipe(
				Effect.tryPromise(() =>
					manager.query.orders.findMany({
						where: (orders, { inArray }) => inArray(orders.id, keys),
						with: {
							customer: {
								with: {
									user: true,
								},
							},
							store: {
								columns: {
									id: true,
									storeImage: true,
									name: true,
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
					}),
				),
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);
		}
		const table = tableNameToTableMap[tableName];

		return yield* pipe(
			Effect.tryPromise(() =>
				manager.select().from(table).where(inArray(table.id, keys)),
			),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
