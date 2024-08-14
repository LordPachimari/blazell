import { relations } from "drizzle-orm";
import {
	index,
	integer,
	json,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";

import type { Image } from "../types/image";
import { orders } from "./order";
import { products } from "./product";
import { adminsToStores, users } from "./user";
export const stores = pgTable(
	"stores",
	{
		id: varchar("id").notNull().primaryKey(),

		name: varchar("name").notNull(),
		logo: json("logo").$type<{
			id: string;
			url: string;
			alt: string;
		}>(),
		currencyCodes: json("currencies").$type<string[]>(),
		founderID: varchar("founder_id")
			.references(() => users.id)
			.notNull(),
		storeImage: json("store_image").$type<Image>(),
		headerImage: json("header_image").$type<Image>(),
		countryCode: varchar("country_code", { length: 2 }).notNull(),
		description: text("description"),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(t) => ({
		storeNameIndex: index("store_name_index").on(t.name),
		founderIDIndex: index("founder_id_index").on(t.founderID),
		countryCodeIndex: index("country_code_index").on(t.countryCode),
	}),
);
export const storesRelations = relations(stores, ({ one, many }) => ({
	founder: one(users, {
		fields: [stores.founderID],
		references: [users.id],
		relationName: "founder.stores",
	}),
	admins: many(adminsToStores),
	products: many(products),
	orders: many(orders),
}));
