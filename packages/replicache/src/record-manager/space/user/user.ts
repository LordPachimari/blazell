import { Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { NeonDatabaseError, type RowsWTableName } from "@blazell/validators";
import { Database } from "@blazell/shared";
import { ReplicacheContext } from "../../../context";

export const userCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* (_) {
		const { authID } = yield* ReplicacheContext;
		if (!authID) return [];
		const { manager } = yield* Database;
		const rowsWTableName: RowsWTableName[] = [];
		yield* _(
			pipe(
				Effect.tryPromise(() =>
					fullRows
						? manager.query.users.findFirst({
								where: (users, { eq }) => eq(users.authID, authID),
							})
						: manager.query.users.findFirst({
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
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			),
		);

		return rowsWTableName;
	});
};
