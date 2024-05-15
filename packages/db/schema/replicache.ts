import {
	index,
	integer,
	json,
	pgTable,
	primaryKey,
	varchar,
} from "drizzle-orm/pg-core";

export type ClientViewRecord = Record<string, number>;
export const replicacheClients = pgTable(
	"replicache_clients",
	{
		id: varchar("id").notNull().primaryKey(),
		replicachePK: varchar("replicache_pk"),
		clientGroupID: varchar("client_group_id").notNull(),
		lastMutationID: integer("last_mutation_id").notNull(),
		version: integer("version"),
	},
	(client) => ({
		groupIDIdx: index("group_id_idx").on(client.clientGroupID),
	}),
);
export const replicacheClientGroups = pgTable("replicache_client_groups", {
	id: varchar("id").notNull().primaryKey(),
	spaceRecordVersion: integer("space_record_version").notNull(),
});
export const replicacheSubspaceRecords = pgTable(
	"replicaсhe_subspace_records",
	{
		id: varchar("id").notNull(),
		replicachePK: varchar("replicache_pk"),
		subspaceID: varchar("subspace_id").notNull(),
		record: json("record").notNull().$type<ClientViewRecord>(),
		version: integer("version"),
	},
	(spaceRecord) => ({
		pk: primaryKey({
			columns: [spaceRecord.id, spaceRecord.subspaceID],
		}),
	}),
);
