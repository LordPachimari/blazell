import { Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { Cloudflare, Database } from "@blazell/shared";
import { NeonDatabaseError } from "@blazell/validators";

export const errorsCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { request } = yield* Cloudflare;

		const userID = request.headers.get("x-user-id");
		const globalID = request.headers.get("x-global-id");
		const id = userID ?? globalID;
		if (!id) return [];
		const { manager } = yield* Database;
		return yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.clientErrors.findMany({
							where: (errors, { eq }) => eq(errors.id, id),
						})
					: manager.query.clientErrors.findMany({
							columns: {
								id: true,
								version: true,
							},
							where: (errors, { eq }) => eq(errors.id, id),
						}),
			),
			Effect.map((errors) => [
				{ tableName: "clientErrors" as const, rows: errors },
			]),
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
};
