import { Console, Effect, pipe } from "effect";

import type { GetRowsWTableName } from "../types";
import { Database } from "@blazell/shared";
import { NeonDatabaseError, NotFound } from "@blazell/validators";
import { ReplicacheContext } from "../../../context";

export const ordersCVD: GetRowsWTableName = ({ fullRows }) => {
	return Effect.gen(function* () {
		const { authID } = yield* ReplicacheContext;
		if (!authID) return [];
		const { manager } = yield* Database;

		const ordersCVD = yield* pipe(
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
								with: {
									shippingAddress: true,
									billingAddress: true,
									store: {
										columns: {
											id: true,
											storeImage: true,
											name: true,
										},
									},
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
											product: true,
										},
									},
								},
							})
						: manager.query.orders.findMany({
								columns: {
									id: true,
									version: true,
								},
								where: (orders, { eq }) => eq(orders.email, email),
								with: {
									items: {
										columns: {
											id: true,
											version: true,
										},
									},
								},
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
		yield* Console.log("ORDERS CVD", JSON.stringify(ordersCVD));
		return ordersCVD;
	});
};
