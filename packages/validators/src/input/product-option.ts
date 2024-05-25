import { schema } from "@blazell/db";
import type { InferInsertModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const ProductOptionSchema = createInsertSchema(schema.productOptions);
export const CreateProductOptionSchema = z.object({
	option: ProductOptionSchema,
});
export type CreateProductOption = z.infer<typeof CreateProductOptionSchema>;
export const UpdateProductOptionSchema = z.object({
	updates: ProductOptionSchema.pick({ name: true }),
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
