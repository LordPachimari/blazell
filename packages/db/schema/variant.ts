import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	json,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";

import { prices } from "./price";
import { products } from "./product";
import { productOptionValuesToVariants } from "./product-option-value";
import type { Image } from "../types/image";

const weightUnits = ["kg", "g", "lb", "oz"] as const;
export const variants = pgTable(
	"variants",
	{
		id: varchar("id").notNull().primaryKey(),

		title: varchar("title"),
		handle: varchar("handle"),
		barcode: varchar("barcode"),
		quantity: integer("quantity").notNull(),
		metadata: json("metadata").$type<Record<string, string>>(),
		productID: varchar("product_id")
			.references(() => products.id, {
				onDelete: "cascade",
			})
			.notNull(),
		sku: varchar("sku"),
		weight: integer("weight"),
		weightUnit: text("weight_unit", { enum: weightUnits }),
		allowBackorder: boolean("allow_backorder").default(false),
		thumbnail: json("thumbnail").$type<Image>(),
		images: json("images").$type<Image[]>(),
		updatedBy: varchar("updated_by"),
		createdAt: varchar("created_at"),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		version: integer("version").notNull().default(0),
	},
	(variant) => ({
		productIDIndex: index("product_id_index").on(variant.productID),
	}),
);
export const variantRelations = relations(variants, ({ one, many }) => ({
	product: one(products, {
		fields: [variants.productID],
		references: [products.id],
	}),
	prices: many(prices),
	optionValues: many(productOptionValuesToVariants),
}));
