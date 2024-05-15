import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	primaryKey,
	varchar,
} from "drizzle-orm/pg-core";

import { productOptions } from "./product-option";
import { variants } from "./variant";

export const productOptionValues = pgTable(
	"product_option_values",
	{
		id: varchar("id").notNull().primaryKey(),
		replicachePK: varchar("replicache_pk"),
		variantID: varchar("variant_id").references(() => variants.id),
		value: varchar("value").notNull(),
		optionID: varchar("option_id")
			.notNull()
			.references(() => productOptions.id, { onDelete: "cascade" }),
		version: integer("version").notNull().default(0),
	},
	(productOption) => ({
		variantIDIndex: index("variant_id_index").on(productOption.variantID),
		optionIDIndex: index("option_id_index").on(productOption.optionID),
	}),
);
export const productOptionValuesRelations = relations(
	productOptionValues,
	({ one }) => ({
		option: one(productOptions, {
			fields: [productOptionValues.optionID],
			references: [productOptions.id],
		}),
	}),
);
export const productOptionValuesToVariants = pgTable(
	"product_option_values_to_variants",
	{
		id: varchar("id").notNull(),
		replicachePK: varchar("replicache_pk"),
		optionValueID: varchar("option_value_id")
			.notNull()
			.references(() => productOptionValues.id, { onDelete: "cascade" }),
		variantID: varchar("variant_id")
			.notNull()
			.references(() => variants.id, { onDelete: "cascade" }),
		version: integer("version"),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.optionValueID, t.variantID] }),
		index: index("povtov_id_index").on(t.id),
	}),
);
export const productOptionValuesToVariantsRelations = relations(
	productOptionValuesToVariants,
	({ one }) => ({
		variant: one(variants, {
			fields: [productOptionValuesToVariants.variantID],
			references: [variants.id],
		}),
		optionValue: one(productOptionValues, {
			fields: [productOptionValuesToVariants.optionValueID],
			references: [productOptionValues.id],
		}),
	}),
);
