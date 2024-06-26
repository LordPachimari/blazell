import { Effect } from "effect";

import { generateRandomWithBias } from "@blazell/utils";

import { NeonDatabaseError, type RowsWTableName } from "@blazell/validators";
import type { GetRowsWTableName } from "../types";
import { Database } from "@blazell/shared";

export const productsCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const rowsWTableName: RowsWTableName[] = [];
		const { manager } = yield* Database;
		const productsCVD = yield* Effect.tryPromise(() =>
			fullRows
				? manager.query.products.findMany({
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
					})
				: manager.query.products.findMany({
						where: (products, { eq }) => eq(products.status, "published"),
						columns: {
							id: true,
							version: true,

							score: true,
						},
						with: {
							variants: {
								columns: {
									id: true,
									version: true,
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
						rows: productsCVD.flatMap((value) => value.variants),
					}),
				),
				Effect.sync(() =>
					rowsWTableName.push({
						tableName: "products" as const,
						rows: productsCVD.map((product) => {
							product.variants = [];
							product.score = generateRandomWithBias(1, 2, 1, 5);
							return product;
						}),
					}),
				),
			],
			{ concurrency: 2 },
		);
		yield* Effect.log(`PRODUCTS CVD ${JSON.stringify(rowsWTableName)}`);

		return rowsWTableName;
	});
};
