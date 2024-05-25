import { z } from "zod";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { schema } from "@blazell/db";

const InsertProductSchema = createInsertSchema(schema.products);
export const ProductSchema = createSelectSchema(schema.products);
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
