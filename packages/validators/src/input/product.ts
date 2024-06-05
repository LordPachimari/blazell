import { z } from "zod";

import { schema } from "@blazell/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { PriceSchema } from "./price";
import { ProductOptionSchema } from "./product-option";
import { ProductOptionValueSchema } from "./product-option-value";
import { InsertVariantSchema, VariantSchema } from "./variant";

const InsertProductSchema = createInsertSchema(schema.products).extend({
	defaultVariant: InsertVariantSchema.optional(),
});
export const ProductSchema = createSelectSchema(schema.products);
export const PublishedProductSchema = ProductSchema;
export type InsertProduct = z.infer<typeof InsertProductSchema>;
export const CreateProductSchema = z.object({
	product: InsertProductSchema,
});
export type CreateProduct = z.infer<typeof CreateProductSchema>;

const ProductUpdatesSchema = InsertProductSchema.pick({
	collectionID: true,
	discountable: true,
	status: true,
	description: true,
});

export const UpdateProductSchema = z.object({
	updates: ProductUpdatesSchema,
	id: z.string(),
});
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export const AssignOptionValueToVariantSchema = z.object({
	optionValueID: z.string(),
	variantID: z.string(),
	prevOptionValueID: z.string().optional(),
	productID: z.string(),
});
export type AssignOptionValueToVariant = z.infer<
	typeof AssignOptionValueToVariantSchema
>;

export const ProductDuplicateSchema = z.object({
	originalProductID: z.string(),
	newDefaultVariantID: z.string(),
	newProductID: z.string(),
	newPriceIDs: z.array(z.string()),
	newOptionIDs: z.array(z.string()),
	newOptionValueIDs: z.array(z.string()),
});

export type ProductDuplicate = z.infer<typeof ProductDuplicateSchema>;

export const DuplicateProductSchema = z.object({
	duplicates: z.array(ProductDuplicateSchema),
});
export type DuplicateProduct = z.infer<typeof DuplicateProductSchema>;
