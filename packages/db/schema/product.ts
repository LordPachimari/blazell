import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	json,
	pgTable,
	primaryKey,
	text,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

import { collections } from "./collection";
import { prices } from "./price";
import { productOptions } from "./product-option";
import { stores } from "./store";
import { tags } from "./tag";
import { variants } from "./variant";

export const productStatus = ["draft", "published", "archived"] as const;
const weightUnits = ["kg", "g", "lb", "oz"] as const;

export const products = pgTable(
	"products",
	{
		id: varchar("id").notNull().primaryKey(),

		defaultVariantID: varchar("default_variant_id").notNull(),
		metadata: json("metadata").$type<Record<string, string>>(),
		description: text("description"),
		collectionID: varchar("collection_pk").references(() => collections.id),
		score: integer("score").default(0),
		discountable: boolean("discountable").notNull().default(false),
		originCountry: varchar("origin_country"),
		status: text("status", {
			enum: productStatus,
		})
			.notNull()
			.default("draft"),
		updatedBy: varchar("updated_by"),
		storeID: varchar("store_id")
			.notNull()
			.references(() => stores.id, { onDelete: "cascade" }),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull(),
	},
	(product) => ({
		collectionIDIndex: index("collection_id_index1").on(product.collectionID),
		statusIndex: index("status_index1").on(product.status),
		storeIDIndex: index("store_id_index1").on(product.storeID),
		scoreIndex: index("score_index").on(product.score),
		defaultVariantIDIndex: index("default_variant_id_index").on(
			product.defaultVariantID,
		),
	}),
);
export const productsRelations = relations(products, ({ one, many }) => ({
	collection: one(collections, {
		fields: [products.collectionID],
		references: [collections.id],
	}),
	variants: many(variants),
	options: many(productOptions),
	tags: many(productsToTags),
	store: one(stores, {
		fields: [products.storeID],
		references: [stores.id],
	}),
	defaultVariant: one(variants, {
		fields: [products.defaultVariantID],
		references: [variants.id],
	}),
}));
export const productsToTags = pgTable(
	"products_to_tags",
	{
		id: varchar("id"),

		productID: varchar("product_id")
			.notNull()
			.references(() => products.id, { onDelete: "cascade" }),
		tagID: varchar("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		version: integer("version"),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.productID, t.tagID] }),
	}),
);
export const productToTagsRelations = relations(productsToTags, ({ one }) => ({
	product: one(products, {
		fields: [productsToTags.productID],
		references: [products.id],
	}),
	tag: one(tags, {
		fields: [productsToTags.tagID],
		references: [tags.id],
	}),
}));
