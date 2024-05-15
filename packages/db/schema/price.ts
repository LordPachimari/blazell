import { relations } from "drizzle-orm";
import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { variants } from "./variant";
import { products } from "./product";

export const prices = pgTable(
	"prices",
	{
		id: varchar("id").notNull().primaryKey(),
		replicachePK: varchar("replicache_pk"),
		variantID: varchar("variant_id").references(() => variants.id, {
			onDelete: "cascade",
		}),
		productID: varchar("product_id").references(() => products.id, {
			onDelete: "cascade",
		}),
		amount: integer("amount").notNull(),
		currencyCode: varchar("currency_code").notNull(),
		version: integer("version"),
	},
	(price) => ({
		variantIDIndex: index("variant_id_index_1").on(price.variantID),
		productIDIndex: index("product_id_index_1").on(price.productID),
	}),
);
export const pricesRelations = relations(prices, ({ one }) => ({
	variant: one(variants, {
		fields: [prices.variantID],
		references: [variants.id],
	}),
	product: one(products, {
		fields: [prices.productID],
		references: [products.id],
	}),
}));
