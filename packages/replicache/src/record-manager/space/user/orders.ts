import { Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { Database } from "@blazell/shared";
import { NeonDatabaseError, NotFound } from "@blazell/validators";
import { ReplicacheContext } from "../../../context";

export const ordersCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authID } = yield* ReplicacheContext;
		if (!authID) return [];
		const { manager } = yield* Database;

		return yield* pipe(
			Effect.tryPromise(() =>
				manager.query.users.findFirst({
					where: (users, { eq }) => eq(users.authID, authID),
					columns: {
						email: true,
					},
				}),
			),
			Effect.flatMap((userEmail) => {
				if (!userEmail)
					return Effect.fail(new NotFound({ message: "User not found" }));
				return Effect.succeed(userEmail.email);
			}),
			Effect.flatMap((email) =>
				Effect.tryPromise(() =>
					fullRows
						? manager.query.orders.findMany({
								where: (orders, { eq }) => eq(orders.email, email),
							})
						: manager.query.orders.findMany({
								columns: {
									id: true,
									version: true,
								},
								where: (orders, { eq }) => eq(orders.email, email),
							}),
				),
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
				NotFound: () => Effect.succeed([]),
			}),
		);
	});
};
