import type { Effect } from "effect";
import type { PatchOperation } from "replicache";

import type { TableName, Transaction } from "@pachi/db";
import type { ExtractEffectValue } from "@pachi/utils";
import type {
	ClientGroupObject,
	ClientViewRecord,
	ReplicacheClient,
	ReplicacheSubspaceRecord,
	RowsWTableName,
	SpaceID,
	SpaceRecord,
} from "@pachi/validators";

import {
	createSpacePatch,
	createSpaceResetPatch,
	deleteClientRecord,
	deleteSpaceRecord,
	diffClientRecords,
	diffSpaceRecords,
	getClientGroupObject,
	getNewClientRecord,
	getNewSpaceRecord,
	getOldClientRecord,
	getOldSpaceRecord,
	setClientGroupObject,
	setClientRecord,
	setSpaceRecord,
} from "./data";
import type { Cookies } from "../../context/cookies";

interface SpaceRecordDiff {
	newIDs: Map<TableName, Set<string>>;
	deletedIDs: string[];
}

type SubspaceRecord = Omit<
	ReplicacheSubspaceRecord,
	"version" | "replicachePK"
>;

type ClientRecordDiff = Record<string, number>;

interface ReplicacheRecordManagerBase {
	getOldClientRecord: (
		key: string,
	) => Effect.Effect<ClientViewRecord | undefined, never, never>;
	getNewClientRecord: () => Effect.Effect<
		Pick<ReplicacheClient, "id" | "lastMutationID">[],
		never,
		never
	>;
	getOldSpaceRecord: (
		key: string,
	) => Effect.Effect<Array<SubspaceRecord> | undefined, never, never>;
	getNewSpaceRecord: (newSpaceKey: string) => Effect.Effect<
		Array<{
			rows: Array<RowsWTableName>;
			subspaceRecord: SubspaceRecord;
		}>,
		never,
		Cookies
	>;
	getClientGroupObject: () => Effect.Effect<ClientGroupObject, never, never>;
	diffSpaceRecords: (
		prevRecord: ExtractEffectValue<ReturnType<this["getOldSpaceRecord"]>>,
		currentRecord: ExtractEffectValue<ReturnType<this["getNewSpaceRecord"]>>,
	) => Effect.Effect<SpaceRecordDiff, never, never>;
	diffClientRecords: (
		prevRecord: ExtractEffectValue<ReturnType<this["getOldClientRecord"]>>,
		currentRecord: ExtractEffectValue<ReturnType<this["getNewClientRecord"]>>,
	) => Effect.Effect<ClientRecordDiff, never, never>;
	createSpacePatch: (
		diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
	) => Effect.Effect<PatchOperation[], never, never>;
	createSpaceResetPatch: (
		diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
	) => Effect.Effect<PatchOperation[], never, Cookies>;
	setClientRecord: (
		newClientRecord: Pick<ReplicacheClient, "id" | "lastMutationID">[],
		newKey: string,
	) => Effect.Effect<void, never, never>;
	deleteClientRecord: (
		key: string | undefined,
	) => Effect.Effect<void, never, never>;
	setSpaceRecord: (
		spaceRecord: Array<SubspaceRecord>,
	) => Effect.Effect<void, never, never>;
	setClientGroupObject: (
		clientGroupObject: ClientGroupObject,
	) => Effect.Effect<void, never, never>;

	deleteSpaceRecord: (
		keys: string[] | undefined,
	) => Effect.Effect<void, never, never>;
}

class ReplicacheRecordManager implements ReplicacheRecordManagerBase {
	private readonly spaceID: SpaceID;
	private readonly subspaceIDs: SpaceRecord[SpaceID] | undefined;
	private readonly transaction: Transaction;
	private readonly clientGroupID: string;
	private readonly authID: string | null | undefined;
	constructor({
		spaceID,
		subspaceIDs,
		transaction,
		clientGroupID,
		authID,
	}: {
		spaceID: SpaceID;
		subspaceIDs: SpaceRecord[SpaceID] | undefined;
		transaction: Transaction;
		clientGroupID: string;
		authID: string | null | undefined;
	}) {
		this.spaceID = spaceID;
		this.transaction = transaction;
		this.subspaceIDs = subspaceIDs;
		this.clientGroupID = clientGroupID;
		this.authID = authID;
	}
	getOldClientRecord(key: string | undefined) {
		return getOldClientRecord({
			key,
			transaction: this.transaction,
		});
	}
	getNewClientRecord() {
		return getNewClientRecord({
			clientGroupID: this.clientGroupID,
			transaction: this.transaction,
		});
	}
	getOldSpaceRecord(key: string | undefined) {
		return getOldSpaceRecord({
			key,
			spaceID: this.spaceID,
			transaction: this.transaction,
			subspaceIDs: this.subspaceIDs,
		});
	}
	getNewSpaceRecord(newSpaceRecordKey: string) {
		return getNewSpaceRecord({
			spaceID: this.spaceID,
			transaction: this.transaction,
			subspaceIDs: this.subspaceIDs,
			authID: this.authID,
			newSpaceRecordKey,
		});
	}
	getClientGroupObject() {
		return getClientGroupObject({
			transaction: this.transaction,
			clientGroupID: this.clientGroupID,
		});
	}

	diffClientRecords(
		prevRecord: ExtractEffectValue<ReturnType<this["getOldClientRecord"]>>,

		currentRecord: ExtractEffectValue<ReturnType<this["getNewClientRecord"]>>,
	) {
		return diffClientRecords({ prevRecord, currentRecord });
	}

	diffSpaceRecords(
		prevRecord: ExtractEffectValue<ReturnType<this["getOldSpaceRecord"]>>,
		currentRecord: ExtractEffectValue<ReturnType<this["getNewSpaceRecord"]>>,
	) {
		return diffSpaceRecords({ prevRecord, currentRecord });
	}

	createSpacePatch(
		diff: ExtractEffectValue<ReturnType<this["diffSpaceRecords"]>>,
	) {
		return createSpacePatch({
			diff,
			transaction: this.transaction,
		});
	}

	createSpaceResetPatch() {
		return createSpaceResetPatch({
			transaction: this.transaction,
			spaceID: this.spaceID,
			authID: this.authID,
		});
	}

	setClientRecord(
		newClientRecord: Pick<ReplicacheClient, "id" | "lastMutationID">[],
		newKey: string,
	) {
		return setClientRecord({
			newClientRecord,
			transaction: this.transaction,
			newKey,
		});
	}
	deleteClientRecord(key: string | undefined) {
		return deleteClientRecord({
			key,
			transaction: this.transaction,
		});
	}
	setSpaceRecord(spaceRecord: Array<SubspaceRecord>) {
		return setSpaceRecord({
			spaceRecord,
			transaction: this.transaction,
		});
	}
	deleteSpaceRecord(keys: string[] | undefined) {
		return deleteSpaceRecord({
			keys,
			transaction: this.transaction,
		});
	}
	setClientGroupObject(clientGroupObject: ClientGroupObject) {
		return setClientGroupObject({
			clientGroupObject,
			transaction: this.transaction,
		});
	}
}

export { ReplicacheRecordManager };
export type {
	ClientRecordDiff,
	ReplicacheRecordManagerBase,
	SpaceRecordDiff,
	SubspaceRecord,
};
