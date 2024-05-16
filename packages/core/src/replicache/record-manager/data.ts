import { eq, inArray } from "drizzle-orm";
import { Effect, pipe } from "effect";
import { isArray, isDefined, keys, mapToObj } from "remeda";
import type { PatchOperation, ReadonlyJSONObject } from "replicache";

import {
	schema,
	tableNameToTableMap,
	type Db,
	type TableName,
	type Transaction,
} from "@pachi/db";

import {
	UnknownExceptionLogger,
	generateRandomWithBias,
	type ExtractEffectValue,
} from "@pachi/utils";
import {
	InvalidValue,
	SPACE_RECORD,
	type ClientGroupObject,
	type ClientViewRecord,
	type ReplicacheClient,
	type RowsWTableName,
	type SpaceID,
	type SpaceRecord,
} from "@pachi/validators";

import type {
	ClientRecordDiff,
	ReplicacheRecordManagerBase,
	SpaceRecordDiff,
	SubspaceRecord,
} from "./manager";
import { SpaceRecordGetter } from "./space/getter";
import type { Cookies } from "../../context/cookies";
import { get } from "effect/Record";

export const makeClientViewRecord = (
	data: RowsWTableName[],
): Record<string, number> => {
	const clientViewRecord: Record<string, number> = {};

	for (const { rows } of data) {
		for (const row of rows) {
			clientViewRecord[row.id] = row.version;
		}
	}

	return clientViewRecord;
};

export const getRowsWTableName = <T extends SpaceID>({
	authID,
	spaceID,
	subspaceID,
	transaction,
	fullRows,
}: {
	spaceID: T;
	authID: string | null | undefined;
	subspaceID: SpaceRecord[T][number];
	transaction: Transaction;
	fullRows: boolean;
}): Effect.Effect<RowsWTableName[], InvalidValue, Cookies> => {
	const getRowsWTableName = SpaceRecordGetter[spaceID][subspaceID];
	if (getRowsWTableName) {
		return getRowsWTableName({
			transaction,
			authID,
			fullRows,
		});
	}

	return Effect.fail(
		new InvalidValue({
			message: "Invalid spaceID or subspaceID",
		}),
	);
};

const getOldSpaceRecord = <T extends SpaceID>({
	key,
	spaceID,
	transaction,
	subspaceIDs,
}: {
	key: string | undefined;
	spaceID: T;
	transaction: Transaction;
	subspaceIDs: SpaceRecord[T] | undefined;
}): ReturnType<ReplicacheRecordManagerBase["getOldSpaceRecord"]> => {
	return Effect.gen(function* (_) {
		if (!key) return undefined;
		const subIDs = subspaceIDs ?? SPACE_RECORD[spaceID];

		const result = yield* _(
			pipe(
				Effect.tryPromise(() =>
					transaction.query.replicacheSubspaceRecords.findMany({
						columns: {
							id: true,
							subspaceID: true,
							record: true,
						},
						where: ({ subspaceID, id }, { inArray, eq, and }) =>
							//@ts-ignore
							and(eq(id, key), inArray(subspaceID, subIDs)),
					}),
				),
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "GET PREVIOUS SPACE RECORD ERROR"),
				),
			),
		);
		return result;
	});
};

const getNewSpaceRecord = <T extends SpaceID>({
	spaceID,
	transaction,
	subspaceIDs,
	authID,
	newSpaceRecordKey,
}: {
	spaceID: T;
	transaction: Transaction;
	subspaceIDs: SpaceRecord[T] | undefined;
	authID: string | null | undefined;
	newSpaceRecordKey: string;
}): ReturnType<ReplicacheRecordManagerBase["getNewSpaceRecord"]> => {
	return Effect.gen(function* (_) {
		const subIDs = subspaceIDs ?? SPACE_RECORD[spaceID];

		return yield* _(
			Effect.forEach(
				subIDs,
				(subspaceID) =>
					pipe(
						getRowsWTableName({
							spaceID,
							subspaceID,
							transaction,
							authID,
							fullRows: false,
						}),
						Effect.map((rows) => ({
							rows,
							subspaceRecord: {
								id: newSpaceRecordKey,
								subspaceID,
								record: makeClientViewRecord(rows),
							},
						})),
						Effect.orDie,
					),

				{
					concurrency: "unbounded",
				},
			),
			Effect.orDie,
		);
	});
};

const diffSpaceRecords = ({
	currentRecord,
	prevRecord,
}: {
	prevRecord: ExtractEffectValue<
		ReturnType<ReplicacheRecordManagerBase["getOldSpaceRecord"]>
	>;
	currentRecord: ExtractEffectValue<
		ReturnType<ReplicacheRecordManagerBase["getNewSpaceRecord"]>
	>;
}): ReturnType<ReplicacheRecordManagerBase["diffSpaceRecords"]> => {
	return Effect.gen(function* (_) {
		const diff: SpaceRecordDiff = {
			deletedIDs: [],
			newIDs: new Map(),
		};

		if (!prevRecord) {
			return diff;
		}

		const prevSpaceRecordObj = mapToObj(prevRecord, (data) => [
			data.subspaceID,
			data.record,
		]);

		yield* _(
			Effect.forEach(
				currentRecord,
				({ rows, subspaceRecord }) => {
					return Effect.gen(function* (_) {
						const prevClientViewRecord =
							prevSpaceRecordObj[subspaceRecord.subspaceID] ?? {};

						for (const { tableName, rows: _rows } of rows) {
							const newIDs = diff.newIDs.get(tableName) ?? new Set();

							yield* _(
								Effect.all(
									[
										Effect.forEach(
											_rows,
											({ id, version }) =>
												Effect.sync(() => {
													const prevVersion = prevClientViewRecord[id];

													if (
														!isDefined.strict(prevVersion) ||
														prevVersion < version
													) {
														newIDs.add(id);
													}
												}),
											{ concurrency: "unbounded" },
										),
										Effect.forEach(
											keys(prevClientViewRecord),
											(id) =>
												Effect.sync(() => {
													if (!isDefined.strict(subspaceRecord.record[id])) {
														diff.deletedIDs.push(id);
													}
												}),
											{ concurrency: "unbounded" },
										),
									],
									{
										concurrency: 2,
									},
								),
							);

							diff.newIDs.set(tableName, newIDs);
						}
					});
				},
				{ concurrency: "unbounded" },
			),
		);

		return diff;
	});
};

const getOldClientRecord = ({
	key,
	transaction,
}: {
	key: string | undefined;
	transaction: Transaction;
}): ReturnType<ReplicacheRecordManagerBase["getOldClientRecord"]> =>
	Effect.gen(function* (_) {
		if (!key) {
			return undefined;
		}
		const spaceRecord = yield* _(
			Effect.tryPromise(() =>
				transaction.query.jsonTable.findFirst({
					where: (json, { eq }) => eq(json.id, key),
				}),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "GET PREVIOUS CLIENT RECORD ERROR"),
				),
			),
		);

		if (spaceRecord?.value) return spaceRecord.value as ClientViewRecord;

		return undefined;
	});

const getNewClientRecord = ({
	transaction,
	clientGroupID,
}: {
	transaction: Transaction;
	clientGroupID: string;
}): ReturnType<ReplicacheRecordManagerBase["getNewClientRecord"]> =>
	pipe(
		Effect.tryPromise(() =>
			transaction
				.select({
					id: schema.replicacheClients.id,
					lastMutationID: schema.replicacheClients.lastMutationID,
				})
				.from(schema.replicacheClients)
				//ASSUME THAT THE CLIENT HAS MAX 20 TABS OPEN
				.where(eq(schema.replicacheClients.clientGroupID, clientGroupID))
				.limit(20),
		),
		Effect.orDieWith((e) =>
			UnknownExceptionLogger(e, "GET CURRENT CLIENT RECORD ERROR"),
		),
	);

const diffClientRecords = ({
	currentRecord,
	prevRecord,
}: {
	prevRecord: ExtractEffectValue<
		ReturnType<ReplicacheRecordManagerBase["getOldClientRecord"]>
	>;
	currentRecord: ExtractEffectValue<
		ReturnType<ReplicacheRecordManagerBase["getNewClientRecord"]>
	>;
}): ReturnType<ReplicacheRecordManagerBase["diffClientRecords"]> => {
	return Effect.gen(function* (_) {
		const diff: ClientRecordDiff = {};

		if (!prevRecord)
			return mapToObj(currentRecord, (client) => [
				client.id,
				client.lastMutationID,
			]);

		yield* _(
			Effect.forEach(
				currentRecord,
				({ id, lastMutationID }) => {
					return Effect.sync(() => {
						if (
							!isDefined.strict(prevRecord[id]) ||
							(prevRecord[id] ?? -1) < lastMutationID
						) {
							diff[id] = lastMutationID;
						}
					});
				},
				{ concurrency: "unbounded" },
			),
		);

		return diff;
	});
};

const createSpacePatch = ({
	diff,
	transaction,
}: {
	diff: SpaceRecordDiff;
	transaction: Transaction;
}): ReturnType<ReplicacheRecordManagerBase["createSpacePatch"]> => {
	return Effect.gen(function* (_) {
		const patch: PatchOperation[] = [];
		const [fullRows, replicachePKs] = yield* _(
			Effect.all(
				[
					Effect.forEach(
						diff.newIDs.entries(),
						([tableName, ids]) => {
							return getFullRows({
								keys: Array.from(ids),
								tableName,
								transaction,
							});
						},
						{ concurrency: "unbounded" },
					).pipe(Effect.map((fullRows) => fullRows.flat())),

					getReplicachePKs({
						keys: diff.deletedIDs,
						transaction,
					}),
				],
				{
					concurrency: 2,
				},
			),
		);
		yield* _(
			Effect.log(`REPLICACHE PKS<<____ ${JSON.stringify(replicachePKs)}`),
		);

		const deletePatchEffect = Effect.forEach(
			replicachePKs,
			({ replicachePK }) => {
				return Effect.sync(() => {
					if (replicachePK)
						patch.push({
							op: "del",
							key: replicachePK,
						});
				});
			},
			{ concurrency: "unbounded" },
		);
		const putPatchEffect = Effect.forEach(
			fullRows,
			(item) => {
				return Effect.sync(() => {
					if (item?.replicachePK) {
						patch.push({
							op: "put",
							key: item.replicachePK,
							value: item as ReadonlyJSONObject,
						});
					}
				});
			},
			{ concurrency: "unbounded" },
		);

		yield* _(
			Effect.all([deletePatchEffect, putPatchEffect], {
				concurrency: 2,
			}),
		);

		return patch;
	});
};

const createSpaceResetPatch = <T extends SpaceID>({
	spaceID,
	transaction,
	authID,
}: {
	spaceID: T;
	authID: string | null | undefined;
	transaction: Transaction;
}): ReturnType<ReplicacheRecordManagerBase["createSpaceResetPatch"]> =>
	Effect.gen(function* (_) {
		yield* _(Effect.log("RESET PATCH"));
		const patch: PatchOperation[] = [
			{
				op: "clear" as const,
			},
		];
		const subspaceIDs = SPACE_RECORD[spaceID];

		yield* _(
			Effect.forEach(
				subspaceIDs,
				(subspaceID) =>
					pipe(
						getRowsWTableName({
							spaceID,
							subspaceID,
							transaction,
							authID,
							fullRows: true,
						}),
						Effect.flatMap((data) =>
							Effect.gen(function* (_) {
								yield* _(
									Effect.forEach(
										data,
										({ rows }) =>
											Effect.gen(function* (_) {
												yield* _(
													Effect.forEach(
														rows,
														(item) =>
															Effect.sync(
																() =>
																	item.replicachePK &&
																	patch.push({
																		op: "put",
																		key: item.replicachePK,
																		value: item as ReadonlyJSONObject,
																	}),
															),
														{ concurrency: "unbounded" },
													),
												);
											}),
										{ concurrency: "unbounded" },
									),
								);
							}),
						),
						Effect.orDie,
					),
				{
					concurrency: "unbounded",
				},
			),
		);

		return patch;
	});

const getFullRows = ({
	tableName,
	keys,
	transaction,
}: {
	tableName: TableName;
	keys: string[];
	transaction: Transaction;
}): Effect.Effect<
	Array<{ id: string | null; replicachePK: string | null }>,
	never,
	never
> =>
	Effect.gen(function* (_) {
		if (keys.length === 0) {
			return yield* _(Effect.succeed([]));
		}

		if (tableName === "products") {
			const products = yield* _(
				pipe(
					Effect.tryPromise(() =>
						transaction.query.products.findMany({
							where: (products, { inArray }) => inArray(products.id, keys),
							with: {
								options: {
									with: {
										optionValues: true,
									},
								},
								prices: true,
							},
						}),
					),
					Effect.orDieWith((e) =>
						UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
					),
				),
			);
			return products.map((product) => {
				product.score = generateRandomWithBias(0, 4, 0, 0);
				return product;
			});
		}
		if (tableName === "stores") {
			return yield* _(
				pipe(
					Effect.tryPromise(() =>
						transaction.query.stores.findMany({
							where: (stores, { inArray }) => inArray(stores.id, keys),
							with: {
								founder: true,
							},
						}),
					),
					Effect.orDieWith((e) =>
						UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
					),
				),
			);
		}
		if (tableName === "variants") {
			return yield* _(
				pipe(
					Effect.tryPromise(() =>
						transaction.query.variants.findMany({
							where: (products, { inArray }) => inArray(products.id, keys),
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
						}),
					),
					Effect.orDieWith((e) =>
						UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
					),
				),
			);
		}

		if (tableName === "carts") {
			return yield* _(
				pipe(
					Effect.tryPromise(() =>
						transaction.query.carts.findMany({
							where: (carts, { inArray }) => inArray(carts.id, keys),
							with: {
								shippingAddress: true,
							},
						}),
					),
					Effect.orDieWith((e) =>
						UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
					),
				),
			);
		}
		if (tableName === "lineItems") {
			return yield* _(
				pipe(
					Effect.tryPromise(() =>
						transaction.query.lineItems.findMany({
							where: (items, { inArray }) => inArray(items.id, keys),
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
								product: {
									with: {
										prices: true,
									},
								},
							},
						}),
					),
					Effect.orDieWith((e) =>
						UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
					),
				),
			);
		}
		if (tableName === "orders") {
			return yield* _(
				pipe(
					Effect.tryPromise(() =>
						transaction.query.orders.findMany({
							where: (orders, { inArray }) => inArray(orders.id, keys),
							with: {
								user: {
									columns: {
										id: true,
										fullName: true,
										email: true,
										username: true,
										phone: true,
									},
								},
								shippingAddress: true,
								billingAddress: true,
							},
						}),
					),
					Effect.orDieWith((e) =>
						UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
					),
				),
			);
		}
		const table = tableNameToTableMap[tableName];

		return yield* _(
			pipe(
				Effect.tryPromise(() =>
					transaction
						.select()
						.from(table)
						//@ts-ignore
						.where(inArray(table.id, keys)),
				),
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "GET FULL ROWS ERROR"),
				),
			),
		);
	});

const getReplicachePKs = ({
	keys,
	transaction,
}: {
	keys: string[];
	transaction: Transaction;
}): Effect.Effect<{ replicachePK: string | null }[], never, never> => {
	if (keys.length === 0) {
		return Effect.succeed([]);
	}

	return Effect.tryPromise(() =>
		transaction
			.select({
				replicachePK: schema.jsonTable.replicachePK,
			})
			.from(schema.jsonTable)
			.where(inArray(schema.jsonTable.id, keys)),
	).pipe(
		Effect.orDieWith((e) =>
			UnknownExceptionLogger(e, "GET SECONDARY KEYS ERROR"),
		),
	);
};

export const getClientGroupObject = ({
	clientGroupID,
	transaction,
}: {
	clientGroupID: string;
	transaction: Transaction;
}): Effect.Effect<ClientGroupObject, never, never> =>
	Effect.gen(function* (_) {
		const clientViewData = yield* _(
			Effect.tryPromise(() =>
				transaction.query.replicacheClientGroups.findFirst({
					where: (clientGroup, { eq }) => eq(clientGroup.id, clientGroupID),
				}),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "GET CLIENT GROUP OBJECT ERROR"),
				),
			),
		);

		if (clientViewData) return clientViewData;
		return {
			id: clientGroupID,
			spaceRecordVersion: 0,
			clientVersion: 0,
		};
	});
export const setClientGroupObject = ({
	transaction,
	clientGroupObject,
}: {
	transaction: Transaction;
	clientGroupObject: ClientGroupObject;
}): Effect.Effect<void, never, never> =>
	Effect.gen(function* (_) {
		yield* _(
			Effect.tryPromise(() =>
				transaction
					.insert(schema.replicacheClientGroups)
					.values({
						id: clientGroupObject.id,
						spaceRecordVersion: clientGroupObject.spaceRecordVersion,
					})
					.onConflictDoUpdate({
						target: schema.replicacheClientGroups.id,
						set: {
							spaceRecordVersion: clientGroupObject.spaceRecordVersion,
						},
					}),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "SET CLIENT GROUP OBJECT ERROR"),
				),
			),
		);
	});

export const setClientRecord = ({
	newClientRecord,
	transaction,
	newKey,
}: {
	newClientRecord: Pick<ReplicacheClient, "id" | "lastMutationID">[];
	transaction: Transaction;
	newKey: string;
}) => {
	return Effect.gen(function* (_) {
		if (Object.keys(newClientRecord).length === 0) return;
		const clientRecord = mapToObj(newClientRecord, (client) => [
			client.id,
			client.lastMutationID,
		]);
		yield* _(
			Effect.tryPromise(() =>
				transaction
					.insert(schema.jsonTable)
					.values({
						id: newKey,
						value: clientRecord,
						version: 0,
					})
					.onConflictDoUpdate({
						target: schema.jsonTable.id,
						set: {
							value: clientRecord,
						},
					}),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "SET CLIENT RECORD ERROR"),
				),
			),
		);
	});
};
export const deleteClientRecord = ({
	key,
	transaction,
}: {
	key: string | undefined;
	transaction: Transaction;
}): Effect.Effect<void, never, never> =>
	Effect.gen(function* (_) {
		if (!key) return;
		yield* _(
			Effect.tryPromise(() =>
				transaction
					.delete(schema.jsonTable)
					.where(eq(schema.jsonTable.id, key)),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "DELETE CLIENT RECORD ERROR"),
				),
			),
		);
	});
export const setSpaceRecord = ({
	spaceRecord,
	transaction,
}: {
	spaceRecord: Array<SubspaceRecord>;
	transaction: Transaction;
}): Effect.Effect<void, never, never> =>
	Effect.gen(function* (_) {
		yield* _(
			Effect.tryPromise(() =>
				transaction
					.insert(schema.replicacheSubspaceRecords)
					//@ts-ignore
					.values(spaceRecord),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "SET SPACE RECORD ERROR"),
				),
			),
		);
	});
export const deleteSpaceRecord = ({
	keys,
	transaction,
}: {
	keys: string[] | undefined;
	transaction: Transaction;
}): Effect.Effect<void, never, never> =>
	Effect.gen(function* (_) {
		if (!keys || keys.length === 0) return;

		yield* _(
			Effect.tryPromise(() =>
				transaction
					.delete(schema.replicacheSubspaceRecords)
					.where(inArray(schema.replicacheSubspaceRecords.id, keys)),
			).pipe(
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "DELETE SPACE RECORD ERROR"),
				),
			),
		);
	});

function idToReplicachePK({
	manager,
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
	manager: Transaction | Db;
}) {
	return Effect.gen(function* (_) {
		return yield* _(
			Effect.tryPromise(() => {
				if (!isArray(value)) {
					return manager
						.insert(schema.jsonTable)
						.values({
							id: value.id,
							replicachePK: value.replicachePK ?? "noPK",
							value: {},
							version: 0,
						})
						.onConflictDoNothing();
				}
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
			}),
		);
	});
}
export {
	createSpacePatch,
	createSpaceResetPatch,
	diffClientRecords,
	diffSpaceRecords,
	getNewClientRecord,
	getNewSpaceRecord,
	getOldClientRecord,
	getOldSpaceRecord,
	idToReplicachePK,
};
