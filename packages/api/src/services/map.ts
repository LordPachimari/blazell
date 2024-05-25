import { schema } from "@blazell/db";
import { Database } from "@blazell/shared";
import { NeonDatabaseError } from "@blazell/validators";
import { Effect } from "effect";
import { isArray } from "effect/Array";

export const idToReplicachePK = ({
	value,
}: {
	value:
		| {
				id: string;
				replicachePK?: string | null | undefined;
		  }
		| Array<{
				id: string;
				replicachePK?: string | null | undefined;
		  }>;
}): Effect.Effect<void, NeonDatabaseError, Database> => {
	return Effect.gen(function* (_) {
		const { manager } = yield* Database;
		yield* _(
			Effect.tryPromise(() => {
				if (isArray(value)) {
					const values = value.map((v) => {
						return {
							id: v.id,
							replicachePK: "noPK",
							value: {},
							version: 0,
						};
					});
					return manager
						.insert(schema.jsonTable)
						.values(values)
						.onConflictDoNothing();
				}

				return manager
					.insert(schema.jsonTable)
					.values({
						id: value.id,
						replicachePK: value.replicachePK ?? "noPK",
						value: {},
						version: 0,
					})
					.onConflictDoNothing();
			}).pipe(
				Effect.catchTag(
					"UnknownException",
					(error) => new NeonDatabaseError({ message: error.message }),
				),
			),
		);
	});
};
