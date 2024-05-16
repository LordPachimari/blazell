import { Clock, Effect, Layer } from "effect";

import {
	type Cloudflare,
	Database,
	Server,
	TableMutatorLive,
	type TableMutator,
} from "@pachi/core";
import { schema, tableNameToTableMap, type Db } from "@pachi/db";
import {
	InternalServerError,
	type AuthorizationError,
	type Mutation,
	type NotFound,
	type PushRequest,
	type SpaceID,
	type SpaceRecord,
} from "@pachi/validators";

import type { AffectedSpaces } from "@pachi/core/src/replicache/mutators/server";
import { UnknownExceptionLogger } from "@pachi/utils";
import type { UnknownException } from "effect/Cause";
import { entries } from "remeda";
import type { ZodError } from "zod";

const publicMutators = new Set(Object.keys(Server.UserMutators));

export const push = ({
	body: push,
	authID,
	db,
	spaceID,
	partyKitOrigin,
}: {
	body: PushRequest;
	authID: string | null | undefined;
	db: Db;
	spaceID: SpaceID;
	partyKitOrigin: string;
}) =>
	Effect.gen(function* (_) {
		yield* _(
			Effect.log("----------------------------------------------------"),
		);
		yield* _(Effect.log(`PROCESSING PUSH: ${JSON.stringify(push, null, "")}`));

		const startTime = yield* _(Clock.currentTimeMillis);
		const mutators =
			spaceID === "dashboard"
				? Server.DashboardMutatorsMap
				: Server.UserMutatorsMap;

		const affectedSpacesMap = new Map<
			SpaceID,
			Set<SpaceRecord[SpaceID][number]>
		>();

		yield* _(
			Effect.forEach(push.mutations, (mutation) =>
				Effect.gen(function* (_) {
					if (!authID && !publicMutators.has(mutation.name)) return;
					// 1: START TRANSACTION FOR EACH MUTATION
					const mutationEffect = yield* _(
						Effect.tryPromise(() =>
							db.transaction(
								async (transaction) =>
									Effect.gen(function* (_) {
										yield* _(
											Effect.log("------> Processing TRANSACTION <-----"),
										);
										const DatabaseLive = Layer.succeed(
											Database,
											Database.of({
												manager: transaction,
												tableNameToTableMap,
											}),
										);
										// 2: GET CLIENT ROW
										const baseClient = yield* Effect.tryPromise(() =>
											transaction.query.replicacheClients.findFirst({
												where: (clients, { eq }) =>
													eq(clients.id, mutation.clientID),
											}),
										).pipe(Effect.orDie);

										if (!baseClient) {
											return;
										}

										let updated = false;

										const mutationContext = TableMutatorLive.pipe(
											Layer.provideMerge(DatabaseLive),
										);

										yield* _(Effect.log("MUTATION"));

										// 3: PROCESS MUTATION
										const nextMutationID = yield* _(
											Effect.provide(
												processMutation({
													lastMutationID: baseClient.lastMutationID,
													mutation,
													mutators,
													affectedSpacesMap,
												}),
												mutationContext,
											).pipe(Effect.orDie),
										);

										if (baseClient.lastMutationID < nextMutationID) {
											updated = true;
										}

										if (updated) {
											yield* _(Effect.log("updating client"));
											yield* Effect.tryPromise(() =>
												transaction
													.insert(schema.replicacheClients)
													//@ts-ignore
													.values({
														clientGroupID: push.clientGroupID,
														id: mutation.clientID,
														lastMutationID: nextMutationID,
													})
													.onConflictDoUpdate({
														target: schema.replicacheClients.id,
														set: {
															lastMutationID: nextMutationID,
														},
													}),
											);
										} else {
											yield* _(Effect.log("Nothing to update"));
										}
									}),
								{ isolationLevel: "repeatable read", accessMode: "read write" },
							),
						).pipe(
							Effect.orDieWith((e) =>
								UnknownExceptionLogger(e, "transaction error"),
							),
						),
					);

					yield* _(Effect.retry(mutationEffect, { times: 3 }));
				}),
			),
		);
		yield* _(
			Effect.forEach(
				Array.from(affectedSpacesMap.entries()),
				([spaceID, subspaceIDs]) =>
					Effect.tryPromise(() =>
						fetch(`${partyKitOrigin}/parties/main/${spaceID}`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(Array.from(subspaceIDs)),
						}),
					).pipe(Effect.retry({ times: 2 })),
				{
					concurrency: "unbounded",
				},
			),
		);

		//TODO: send poke
		const endTime = yield* _(Clock.currentTimeMillis);
		yield* _(Effect.log(`Processed all mutations in ${endTime - startTime}`));
	});

const processMutation = ({
	mutation,
	error,
	lastMutationID,
	mutators,
	affectedSpacesMap,
}: {
	mutation: Mutation;
	lastMutationID: number;
	error?: unknown;
	mutators: Server.DashboardMutatorsMapType | Server.UserMutatorsMapType;
	affectedSpacesMap: Map<SpaceID, Set<SpaceRecord[SpaceID][number]>>;
}): Effect.Effect<
	number,
	| ZodError<any>
	| UnknownException
	| NotFound
	| AuthorizationError
	| InternalServerError,
	Database | TableMutator | Cloudflare
> =>
	Effect.gen(function* (_) {
		const expectedMutationID = lastMutationID + 1;

		if (mutation.id < expectedMutationID) {
			yield* _(
				Effect.log(
					`Mutation ${mutation.id} has already been processed - skipping`,
				),
			);

			return lastMutationID;
		}

		if (mutation.id > expectedMutationID) {
			yield* _(
				Effect.logWarning(
					`Mutation ${mutation.id} is from the future - aborting`,
				),
			);

			yield* _(
				Effect.fail(
					new InternalServerError({
						message: `Mutation ${mutation.id} is from the future - aborting`,
					}),
				),
			);
		}

		if (!error) {
			yield* _(
				Effect.log(
					`Processing mutation: ${JSON.stringify(mutation, null, "")}`,
				),
			);
			const start = yield* _(Clock.currentTimeMillis);

			const { name, args } = mutation;

			const mutator = mutators.get(name);

			if (!mutator) {
				yield* _(
					Effect.fail(
						new InternalServerError({
							message: `No mutator found for ${name}`,
						}),
					),
				);

				return lastMutationID;
			}

			//@ts-ignore
			yield* _(mutator(args));

			const affectedSpace = Server.affectedSpaces[name as keyof AffectedSpaces];
			if (!affectedSpace) {
				yield* _(
					Effect.fail(
						new InternalServerError({
							message: `You forgot to add a mutator ${name} to affected space `,
						}),
					),
				);
			}
			yield* _(
				Effect.forEach(
					entries.strict(affectedSpace),
					([spaceID, subspaceIDs]) =>
						Effect.gen(function* (_) {
							const subspaces = affectedSpacesMap.get(spaceID) ?? new Set();
							yield* _(
								Effect.forEach(
									subspaceIDs,
									(subspaceID) => Effect.sync(() => subspaces.add(subspaceID)),
									{ concurrency: "unbounded" },
								),
							);
							yield* _(
								Effect.sync(() => affectedSpacesMap.set(spaceID, subspaces)),
							);
						}),
				),
			);

			const end = yield* _(Clock.currentTimeMillis);

			yield* _(Effect.log(`Processed mutation in ${end - start}`));

			return expectedMutationID;
		}
		// TODO: You can store state here in the database to return to clients to
		// provide additional info about errors.
		yield* _(
			Effect.log(`Handling error from mutation ${JSON.stringify(mutation)} `),
		);

		return lastMutationID;
	});
