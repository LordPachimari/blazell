import { Database } from "@pachi/core";
import { idToReplicachePK } from "@pachi/core/src/replicache/record-manager/data";
import { schema } from "@pachi/db";
import { generateReplicachePK } from "@pachi/utils";
import type { CreateUser } from "@pachi/validators";
import type { InsertStore, InsertUser } from "@pachi/validators/server";
import { Effect } from "effect";
import type { UnknownException } from "effect/Cause";
import type { StatusCode } from "hono/utils/http-status";

const createUser = (
	props: CreateUser,
): Effect.Effect<
	| {
			type: "SUCCESS";
			message: string;
			status: StatusCode;
	  }
	| {
			type: "ERROR";
			message: string;
			status: StatusCode;
	  },
	UnknownException,
	Database
> => {
	return Effect.gen(function* (_) {
		const { countryCode, storeID, user } = props;
		const { manager } = yield* _(Database);

		const newUser: InsertUser = {
			id: user.id,
			email: user.email,
			authID: user.authID,
			createdAt: new Date().toISOString(),
			username: user.username,
			replicachePK: generateReplicachePK({ prefix: "user", id: user.username }),
			version: 0,
		};
		const store: InsertStore = {
			id: storeID,
			createdAt: new Date().toISOString(),
			name: user.username,
			version: 0,
			founderID: user.id,
			replicachePK: generateReplicachePK({
				prefix: "store",
				filterID: user.id,
				id: storeID,
			}),
			countryCode,
		};
		const transaction = yield* _(
			Effect.tryPromise(() =>
				manager.transaction(
					async (tx) =>
						Effect.gen(function* (_) {
							const existingUser = yield* Effect.tryPromise(() =>
								tx.query.users.findFirst({
									where: (users, { eq }) => eq(users.email, user.email),
								}),
							);
							if (existingUser) {
								yield* _(
									Effect.tryPromise(() =>
										tx.update(schema.users).set({
											...user,
										}),
									),
								);
							} else {
								yield* _(
									Effect.tryPromise(() =>
										tx.insert(schema.users).values(newUser),
									),
								);
							}
							yield* _(
								Effect.tryPromise(() => tx.insert(schema.stores).values(store)),
							);
							yield* _(
								Effect.all(
									[
										Effect.tryPromise(() =>
											tx
												.insert(schema.jsonTable)
												.values({
													id: `active_store_id_${user.authID}`,
													version: 0,
													replicachePK: "active_store_id",
													value: {
														id: "active_store_id",
														storeID: storeID,
													},
												})
												.onConflictDoUpdate({
													target: schema.jsonTable.id,
													set: {
														version: 0,
														value: {
															id: "active_store_id",
															storeID: storeID,
														},
													},
												}),
										), //necessary to retrieve PK's for object removal on the client, using the patch
										idToReplicachePK({ value: [store, user], manager: tx }),
									],
									{ concurrency: 2 },
								),
							);
						}),
					{ accessMode: "read write", isolationLevel: "serializable" },
				),
			),
		);
		yield* _(transaction);
		return {
			type: "SUCCESS",
			message: "User created successfully",
			status: 200 as const,
		};
	});
};

export { createUser };
