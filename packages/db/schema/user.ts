import { relations } from "drizzle-orm";
import {
	integer,
	json,
	pgTable,
	primaryKey,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { addresses } from "./address";
import { stores } from "./store";
import type { Image } from "../types";

export const users = pgTable(
	"users",
	{
		id: varchar("id").notNull().primaryKey(),
		username: varchar("username"),
		google_id: varchar("google_id"),
		avatar: json("avatar").$type<Image>(),
		fullName: varchar("full_name"),
		patronymic: varchar("patronymic"),
		email: varchar("email").notNull(),
		phone: varchar("phone"),
		description: text("description"),
		role: text("role", { enum: ["moderator", "user"] })
			.notNull()
			.default("user"),
		metadata: json("metadata").$type<Record<string, string>>(),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(users) => ({
		emailIndex: uniqueIndex("email_index1").on(users.email),
		googleIDIndex: uniqueIndex("google_id_index1").on(users.google_id),
		usernameIndex: uniqueIndex("username_index1").on(users.username),
	}),
);
export const userRelations = relations(users, ({ many }) => ({
	stores: many(stores, { relationName: "founder.stores" }),
	addresses: many(addresses),
}));
export const adminsToStores = pgTable(
	"admins_to_stores",
	{
		userID: varchar("user_id")
			.notNull()
			.references(() => users.id),
		storeID: varchar("store_id")
			.notNull()
			.references(() => stores.id),
	},
	(adminsToStores) => ({
		pk: primaryKey({
			columns: [adminsToStores.userID, adminsToStores.storeID],
		}),
	}),
);
export const adminsToStoresRelations = relations(adminsToStores, ({ one }) => ({
	admin: one(users, {
		fields: [adminsToStores.userID],
		references: [users.id],
	}),
	store: one(stores, {
		fields: [adminsToStores.storeID],
		references: [stores.id],
	}),
}));
