import { Effect } from "effect";

import { UnknownExceptionLogger, generateRandomWithBias } from "@pachi/utils";

import type { RowsWTableName } from "@pachi/validators";
import type { GetRowsWTableName } from "../types";

export const productsCVD: GetRowsWTableName = ({
	transaction,
	fullRows = false,
}) => {
	return Effect.gen(function* (_) {
		const rowsWTableName: RowsWTableName[] = [];
		const productsCVD = yield* _(
			Effect.tryPromise(() =>
				fullRows
					? transaction.query.products.findMany({
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
								prices: true,
							},
						})
					: transaction.query.products.findMany({
							where: (products, { eq }) => eq(products.status, "published"),
							columns: {
								id: true,
								version: true,
								replicachePK: true,
								score: true,
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
						}),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "ERROR RETRIEVING PRODUCTS ROWS"),
				),
			),
		);

		yield* _(
			Effect.all(
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
								product.score = generateRandomWithBias(0, 4, 0, 0);
								return product;
							}),
						}),
					),
				],
				{ concurrency: 2 },
			),
		);
		yield* _(Effect.log(`PRODUCTS CVD ${JSON.stringify(rowsWTableName)}`));

		return rowsWTableName;
	});
};
