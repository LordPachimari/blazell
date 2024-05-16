import { Effect, pipe } from "effect";

import { UnknownExceptionLogger } from "@pachi/utils";

import type { GetRowsWTableName } from "../types";
import type { RowsWTableName } from "@pachi/validators";

export const userCVD: GetRowsWTableName = ({
	transaction,
	authID,
	fullRows = false,
}) => {
	return Effect.gen(function* (_) {
		if (!authID) return [];
		const rowsWTableName: RowsWTableName[] = [];
		yield* _(
			pipe(
				Effect.tryPromise(() =>
					fullRows
						? transaction.query.users.findFirst({
								where: (users, { eq }) => eq(users.authID, authID),
							})
						: transaction.query.users.findFirst({
								columns: {
									id: true,
									version: true,
									replicachePK: true,
								},
								where: (users, { eq }) => eq(users.authID, authID),
							}),
				),
				Effect.map((user) =>
					rowsWTableName.push({
						tableName: "users" as const,
						rows: user ? [user] : [],
					}),
				),
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "ERROR RETRIEVING USER CVD"),
				),
			),
		);

		return rowsWTableName;
	});
};
