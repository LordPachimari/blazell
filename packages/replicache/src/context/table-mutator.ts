import { Context, Effect, Layer } from "effect";
import type { ReadonlyJSONObject } from "replicache";

import { idToReplicachePK } from "@blazell/api";
import { tableNameToTableMap, type TableName } from "@blazell/db";
import { NeonDatabaseError, TableNotFound } from "@blazell/validators";
import { eq, inArray, sql } from "drizzle-orm";
import { isArray } from "effect/Array";
import { isString } from "effect/String";
import { Database } from "@blazell/shared";

type SetItem = ReadonlyJSONObject & {
	id: string;
	replicachePK?: string | null | undefined;
};

const TableMutatorLive = Effect.gen(function* () {
	const { manager } = yield* Database;

	return {
		set: (value: SetItem | Array<SetItem>, tableName: TableName) => {
			if (isArray(value) && value.length === 0) return Effect.succeed({});
			return Effect.gen(function* (_) {
				const table = tableNameToTableMap[tableName];

				if (!table)
					return yield* _(
						Effect.fail(
							new TableNotFound({
								message: "Table name not found",
							}),
						),
					);

				//necessary for object removal on the client, using the patch
				const idToPK = idToReplicachePK({ value });

				const insert = Effect.tryPromise(() => {
					return (
						manager
							.insert(table)
							//@ts-ignore
							.values(isArray(value) ? value : [value])
							.onConflictDoNothing()
					);
				}).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				);

				return yield* Effect.all([insert, idToPK], { concurrency: 2 });
			});
		},
		update: (key: string, value: ReadonlyJSONObject, tableName: TableName) => {
			return Effect.gen(function* (_) {
				const table = tableNameToTableMap[tableName];

				if (!table)
					return yield* Effect.fail(
						new TableNotFound({
							message: "Table name not found",
						}),
					);

				return yield* Effect.tryPromise(() =>
					manager
						.update(table)
						.set({
							...value,
							version: sql`${table.version} + 1`,
						})
						.where(eq(table.id, key)),
				).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				);
			});
		},
		delete: (key: string[] | string, tableName: TableName) => {
			return Effect.gen(function* () {
				const table = tableNameToTableMap[tableName];

				if (!table)
					return yield* Effect.fail(
						new TableNotFound({
							message: "Table name not found",
						}),
					);

				return yield* Effect.tryPromise(() =>
					isString(key)
						? manager.delete(table).where(eq(table.id, key))
						: manager.delete(table).where(inArray(table.id, key)),
				).pipe(
					Effect.catchTags({
						UnknownException: (error) =>
							new NeonDatabaseError({ message: error.message }),
					}),
				);
			});
		},
	};
});
class TableMutator extends Context.Tag("TableMutator")<
	TableMutator,
	Effect.Effect.Success<typeof TableMutatorLive>
>() {
	static Live = Layer.effect(this, TableMutatorLive);
}

export { TableMutator };
