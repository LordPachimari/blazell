import { Effect, pipe } from "effect";

import { AuthContext, Database } from "@blazell/shared";
import { NeonDatabaseError } from "@blazell/validators";
import type { GetRowsWTableName } from "../types";

export const userCVD: GetRowsWTableName = ({ fullRows = false }) => {
	return Effect.gen(function* () {
		const { auth } = yield* AuthContext;
		const userID = auth.user?.id;
		if (!userID) return [];
		const { manager } = yield* Database;
		return yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.users.findFirst({
							where: (users, { eq }) => eq(users.id, userID),
						})
					: manager.query.users.findFirst({
							columns: {
								id: true,
								version: true,
							},
							where: (users, { eq }) => eq(users.id, userID),
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
