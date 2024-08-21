import { schema } from "@blazell/db";
import { AuthContext, Database } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import {
	NeonDatabaseError,
	type InsertStore,
	type InsertUser,
	type Onboard,
} from "@blazell/validators";
import { sql } from "drizzle-orm";
import { Console, Effect } from "effect";
const onboardUser = (props: Onboard) =>
	Effect.gen(function* () {
		const { countryCode, username } = props;
		const { manager } = yield* Database;
		const { authUser } = yield* AuthContext;
		yield* Console.log("AUTH AUTH AUTH AUTH ", authUser, username);
		if (!authUser) return;
		const user: InsertUser = {
			id: generateID({ prefix: "auth" }),
			createdAt: new Date().toISOString(),
			version: 0,
			username,
			email: authUser.email,
			...(authUser.id && { authID: authUser.id }),
			...(authUser.avatar && { avatar: authUser.avatar }),
			...(authUser.fullName && { fullName: authUser.fullName }),
		};
		const store: InsertStore = {
			id: generateID({ prefix: "store" }),
			createdAt: new Date().toISOString(),
			name: username,
			version: 0,
			ownerID: user.id,
			countryCode,
		};

		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.users)
				//@ts-ignore
				.values(user)
				.onConflictDoUpdate({
					target: schema.users.id,
					set: {
						version: sql`${schema.users.version} + 1`,
						username,
						authID: authUser.id,
						...(authUser.avatar && { avatar: authUser.avatar }),
					},
				}),
		);
		yield* Console.log("USER USER USER USER USER ", username);
		yield* Effect.all(
			[
				Effect.tryPromise(() =>
					manager.update(schema.authUsers).set({
						username,
					}),
				),
				Effect.tryPromise(
					//@ts-ignore
					() => manager.insert(schema.stores).values(store),
				),
			],
			{ concurrency: 2 },
		);
		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.jsonTable)
				.values({
					id: `active_store_id_${user.authID}`,
					version: 0,
					value: store.id,
				})
				.onConflictDoUpdate({
					target: schema.jsonTable.id,
					set: {
						version: sql`${schema.jsonTable.version} + 1`,
						value: store.id,
					},
				}),
		);
	}).pipe(
		Effect.catchTags({
			UnknownException: (error) =>
				new NeonDatabaseError({ message: error.message }),
		}),
	);

export { onboardUser };
