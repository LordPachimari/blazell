import { schema } from "@blazell/db";
import { Database } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import {
	NeonDatabaseError,
	type InsertStore,
	type InsertUser,
	type Onboard,
} from "@blazell/validators";
import { Effect } from "effect";
const createUser = ({ email }: { email: string }) =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		const userID = generateID({ prefix: "user" });
		const newUser: InsertUser = {
			id: userID,
			email,
			createdAt: new Date().toISOString(),
			version: 0,
		};
		const [user] = yield* Effect.tryPromise(() =>
			manager
				.insert(schema.users)
				//@ts-ignore
				.values(newUser)
				.returning(),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		);
		return user;
	});
const onboardUser = (props: Onboard & { userID: string }) =>
	Effect.gen(function* () {
		const { countryCode, username, userID } = props;
		const { manager } = yield* Database;
		const storeID = generateID({ prefix: "store" });
		const store: InsertStore = {
			id: storeID,
			createdAt: new Date().toISOString(),
			name: username,
			version: 0,
			founderID: userID,
			countryCode,
		};

		yield* Effect.all(
			[
				Effect.tryPromise(() =>
					manager.update(schema.users).set({
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
	}).pipe(
		Effect.catchTags({
			UnknownException: (error) =>
				new NeonDatabaseError({ message: error.message }),
		}),
	);

export { createUser, onboardUser };
