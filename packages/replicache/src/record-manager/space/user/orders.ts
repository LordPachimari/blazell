import { Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { Database } from "@blazell/shared";
import { NeonDatabaseError } from "@blazell/validators";
import { ReplicacheContext } from "../../../context";

export const ordersCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authID } = yield* ReplicacheContext;
		if (!authID) return [];
		const { manager } = yield* Database;

		const userEmail = yield* Effect.tryPromise(() =>
			manager.query.users.findFirst({
				where: (users, { eq }) => eq(users.authID, authID),
				columns: {
					email: true,
				},
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		if (!userEmail) return [];
		return yield* pipe(
			Effect.tryPromise(() =>
				fullRows
					? manager.query.orders.findMany({
							where: (orders, { eq }) => eq(orders.email, userEmail.email),
						})
					: manager.query.orders.findMany({
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
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
	});
};
