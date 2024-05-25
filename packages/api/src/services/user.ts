import { schema } from "@blazell/db";
import { Database } from "@blazell/shared";
import { generateID, generateReplicachePK } from "@blazell/utils";
import {
	NeonDatabaseError,
	type CreateUser,
	type InsertStore,
	type InsertUser,
} from "@blazell/validators";
import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { jsonTable } from "../../../db/schema";
import { idToReplicachePK } from "./map";

const createUser = (props: CreateUser) =>
	Effect.gen(function* () {
		const { countryCode, user } = props;
		const { manager } = yield* Database;
		const userID = generateID({ prefix: "user" });
		const newUser: InsertUser = {
			id: userID,
			email: user.email,
			authID: user.authID,
			createdAt: new Date().toISOString(),
			username: user.username,
			replicachePK: userID,
			version: 0,
		};
		const storeID = generateID({ prefix: "store" });
		const store: InsertStore = {
			id: storeID,
			createdAt: new Date().toISOString(),
			name: user.username,
			version: 0,
			founderID: userID,
			replicachePK: generateReplicachePK({
				prefix: "store",
				filterID: userID,
				id: storeID,
			}),
			countryCode,
		};
		const existingUser = yield* Effect.tryPromise(() =>
			manager.query.users.findFirst({
				where: (users, { eq }) => eq(users.email, user.email),
			}),
		);
		if (existingUser) {
			yield* Effect.tryPromise(() =>
				manager
					.update(schema.users)
					//@ts-ignore
					.set({
						...user,
					}),
			);
		} else {
			yield* Effect.tryPromise(() =>
				manager
					.insert(schema.users)
					//@ts-ignore
					.values(newUser),
			);
		}
		yield* Effect.tryPromise(
			//@ts-ignore
			() => manager.insert(schema.stores).values(store),
		);
		yield* Effect.all(
			[
				Effect.tryPromise(() =>
					manager
						.insert(schema.jsonTable)
						.values({
							id: `active_store_id_${user.authID}`,
							version: 0,
							replicachePK: "active_store_id",
							value: storeID,
						})
						.onConflictDoUpdate({
							target: schema.jsonTable.id,
							set: {
								version: sql`${jsonTable.version} + 1`,
								value: storeID,
							},
						}),
				),
				/* necessary for object removal on the client, using the patch */
				idToReplicachePK({ value: [store, newUser] }),
			],
			{ concurrency: 2 },
		);
	}).pipe(
		Effect.catchTags({
			UnknownException: (error) =>
				new NeonDatabaseError({ message: error.message }),
		}),
	);

export { createUser };
