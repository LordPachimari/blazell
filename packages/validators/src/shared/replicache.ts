import { createInsertSchema } from "drizzle-zod";
import type { PatchOperation } from "replicache";
import { z } from "zod";

import { schema, type TableName } from "@blazell/db";
import { Schema } from "@effect/schema";
import { Effect, flow } from "effect";
import { decodeUnknown, decodeUnknownSync } from "@effect/schema/Schema";

export const clientGroupSchema = createInsertSchema(
	schema.replicacheClientGroups,
);
export type ClientGroupObject = z.infer<typeof clientGroupSchema>;
export const ReplicacheClientSchema = createInsertSchema(
	schema.replicacheClients,
);
export type ReplicacheClient = z.infer<typeof ReplicacheClientSchema>;
export const ReplicacheSubspaceRecordSchema = createInsertSchema(
	schema.replicacheSubspaceRecords,
).extend({
	record: z.record(z.string(), z.number()),
});
export type ReplicacheSubspaceRecord = z.infer<
	typeof ReplicacheSubspaceRecordSchema
>;
export type ClientViewRecord = Record<string, number>;
export type Row = Record<string, unknown> & {
	id: string;
	replicachePK: string | null;
	version: number;
};
export type RowsWTableName = { tableName: TableName; rows: Row[] };
export const SPACE_RECORD = {
	user: [
		"user" as const,
		"cart" as const,
		"orders" as const,
		"errors" as const,
	],
	dashboard: ["store" as const],
	marketplace: ["products" as const],
};
export const SpaceIDSchema = Schema.Literal("dashboard", "marketplace", "user");
export type SpaceID = Schema.Schema.Type<typeof SpaceIDSchema>;

export type SpaceRecord = typeof SPACE_RECORD;
export class Mutation extends Schema.Class<Mutation>("Mutation")({
	id: Schema.Number,
	name: Schema.String,
	args: Schema.Unknown,
	clientID: Schema.String,
}) {
	static decodeUnknownSync = decodeUnknownSync(this);
	static decodeUnknown = decodeUnknown(this);
}

export class PushRequest extends Schema.Class<PushRequest>("PushRequest")({
	clientGroupID: Schema.String,
	mutations: Schema.Array(Mutation),
}) {
	static decodeUnknownSync = decodeUnknownSync(this);
}

export type PullResponse = {
	cookie: string;
	lastMutationIDChanges: Record<string, number>;
	patch: PatchOperation[];
};
export class Cookie extends Schema.Class<Cookie>("Cookie")({
	spaceRecordKey: Schema.optional(Schema.String),
	clientRecordKey: Schema.optional(Schema.String),
	staticPullKey: Schema.optional(Schema.String),
	order: Schema.Number,
}) {
	static decodeUnknownSync = decodeUnknownSync(this);
}

export class PullRequest extends Schema.Class<PullRequest>("PullRequest")({
	clientGroupID: Schema.String,
	cookie: Schema.Union(Cookie, Schema.Null),
}) {
	static decodeUnknownSync = decodeUnknownSync(this);
}
