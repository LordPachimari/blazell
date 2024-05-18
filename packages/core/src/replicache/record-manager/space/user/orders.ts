import { Effect, pipe } from "effect";

import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";

export const ordersCVD: GetRowsWTableName = ({
	transaction,
	authID,
	fullRows = false,
}) => {
	return Effect.gen(function* (_) {
		if (!authID) return [];

		const userEmail = yield* Effect.tryPromise(() =>
			transaction.query.users.findFirst({
				where: (users, { eq }) => eq(users.authID, authID),
				columns: {
					email: true,
				},
			}),
		).pipe(
			Effect.orDieWith((e) =>
				UnknownExceptionLogger(e, "ERROR RETRIEVING USER EMAIL"),
			),
		);
		if (!userEmail) return [];
		return yield* _(
			pipe(
				Effect.tryPromise(() =>
					fullRows
						? transaction.query.orders.findMany({
								where: (orders, { eq }) => eq(orders.email, userEmail.email),
							})
						: transaction.query.orders.findMany({
								columns: {
									id: true,
									version: true,
									replicachePK: true,
								},
								where: (orders, { eq }) => eq(orders.email, userEmail.email),
							}),
				),
				Effect.map((orders) => [
					{
						tableName: "orders" as const,
						rows: orders,
					},
				]),
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "ERROR RETRIEVING ORDERS CVD"),
				),
			),
		);
	});
};
