import { Effect } from "effect";

import { generateRandomWithBias } from "@blazell/utils";

import { Database } from "@blazell/shared";
import { NeonDatabaseError, type RowsWTableName } from "@blazell/validators";
import type { GetRowsWTableName } from "../types";

export const storesCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const rowsWTableName: RowsWTableName[] = [];
		const { manager } = yield* Database;
		const storesCVD = yield* Effect.tryPromise(() =>
			fullRows
				? manager.query.stores.findMany({
						with: {
							founder: true,
							products: {
								where: (products, { eq }) => eq(products.status, "published"),
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
									defaultVariant: {
										with: {
											prices: true,
										},
									},
									options: {
										with: {
											optionValues: true,
										},
									},
								},
							},
						},
					})
				: manager.query.stores.findMany({
						columns: {
							id: true,
							version: true,
						},
						with: {
							products: {
								where: (products, { eq }) => eq(products.status, "published"),
								columns: {
									id: true,
									version: true,
									score: true,
								},
								with: {
									variants: {
										columns: { id: true, version: true },
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

		yield* Effect.all(
			[
				//push variants before products, as products.variants = [] modifies variants property
				Effect.sync(() =>
					rowsWTableName.push({
						tableName: "variants" as const,
						rows: storesCVD.flatMap((cvd) =>
							cvd.products.flatMap((p) => p.variants),
						),
					}),
				),
				Effect.sync(() =>
					rowsWTableName.push({
						tableName: "products" as const,
						rows: storesCVD.flatMap((cvd) =>
							cvd.products.flatMap((product) => {
								product.variants = [];
								product.score = generateRandomWithBias(1, 2, 1, 5);
								return product;
							}),
						),
					}),
				),
				Effect.sync(() =>
					rowsWTableName.push({
						tableName: "stores" as const,
						rows: storesCVD,
					}),
				),
			],
			{ concurrency: 3 },
		);
		yield* Effect.log(`STORES CVD ${JSON.stringify(rowsWTableName)}`);

		return rowsWTableName;
	});
};
