import { Effect, pipe } from "effect";

import { Database } from "@blazell/shared";
import { NeonDatabaseError } from "@blazell/validators";
import { ReplicacheContext } from "../../../context";
import type { GetRowsWTableName } from "../types";

export const userCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* () {
		const { authID } = yield* ReplicacheContext;
		if (!authID) return [];
		const { manager } = yield* Database;
		return yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.users.findFirst({
							where: (users, { eq }) => eq(users.authID, authID),
						})
					: manager.query.users.findFirst({
							columns: {
								id: true,
								version: true,
							},
							where: (users, { eq }) => eq(users.authID, authID),
						}),
			),
			Effect.map((user) => [
				{ tableName: "users" as const, rows: user ? [user] : [] },
			]),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
};
