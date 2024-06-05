import { schema } from "@blazell/db";
import type { InferInsertModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertProductOptionSchema = createInsertSchema(
	schema.productOptions,
);
export const ProductOptionSchema = createSelectSchema(schema.productOptions);
export type ProductOption = z.infer<typeof ProductOptionSchema>;

export const CreateProductOptionSchema = z.object({
	option: InsertProductOptionSchema,
});
export type CreateProductOption = z.infer<typeof CreateProductOptionSchema>;
export const UpdateProductOptionSchema = z.object({
	updates: InsertProductOptionSchema.pick({ name: true }),
	optionID: z.string(),
	productID: z.string(),
});
export type UpdateProductOption = z.infer<typeof UpdateProductOptionSchema>;
export const DeleteProductOptionSchema = z.object({
	optionID: z.string(),
	productID: z.string(),
});
export type DeleteProductOption = z.infer<typeof DeleteProductOptionSchema>;
export type InsertProductOption = InferInsertModel<
	typeof schema.productOptions
>;
