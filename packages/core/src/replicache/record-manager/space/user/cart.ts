import { Effect, pipe } from "effect";

import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";
import { Cookies } from "../../../../context/cookies";

export const cartCVD: GetRowsWTableName = ({
	transaction,
	fullRows = false,
}) => {
	return Effect.gen(function* (_) {
		const cookies = yield* Cookies;
		const cartID = cookies.cartID;
		if (!cartID) return [];
		const cvd = yield* _(
			pipe(
				Effect.tryPromise(() =>
					fullRows
						? transaction.query.carts.findFirst({
								where: (carts, { eq }) => eq(carts.id, cartID),
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
											product: {
												with: {
													prices: true,
												},
											},
										},
									},
									shippingAddress: true,
								},
							})
						: transaction.query.carts.findFirst({
								columns: {
									id: true,
									version: true,
									replicachePK: true,
								},
								where: (carts, { eq }) => eq(carts.id, cartID),
								with: {
									items: {
										columns: {
											id: true,
											version: true,
											replicachePK: true,
										},
									},
								},
							}),
				),
				Effect.map((cart) => [
					{ tableName: "lineItems" as const, rows: cart?.items ?? [] },
					{
						tableName: "carts" as const,
						rows: cart ? [{ ...cart, items: [] }] : [],
					},
				]),
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "ERROR RETRIEVING CART CVD"),
				),
			),
		);
		yield* Effect.log(`CART CVD ${JSON.stringify(cvd)}`);

		return cvd;
	});
};
