import { ImageSchema, schema } from "@blazell/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { UpdateImagesOrderSchema } from "./image";

export const InsertVariantSchema = createInsertSchema(schema.variants);

export const VariantSchema = createSelectSchema(schema.variants).extend({
	thumbnail: ImageSchema.optional(),
	images: z.array(ImageSchema).optional(),
});
export type InsertVariant = z.infer<typeof InsertVariantSchema>;
export const CreateVariantSchema = z.object({
	variant: InsertVariantSchema,
});
export type CreateVariant = z.infer<typeof CreateVariantSchema>;
const VariantUpdatesSchema = InsertVariantSchema.pick({
	title: true,
	barcode: true,
	quantity: true,
	metadata: true,
	sku: true,
	weight: true,
	weightUnit: true,
	allowBackorder: true,
	thumbnail: true,
}).extend({
	imagesOrder: UpdateImagesOrderSchema.optional(),
});
export const UpdateVariantSchema = z.object({
	id: z.string(),
	updates: VariantUpdatesSchema,
});
export type UpdateVariant = z.infer<typeof UpdateVariantSchema>;
export const PublishedVariantSchema = VariantSchema.required({
	title: true,
	quantity: true,
});
export type PublishedVariant = z.infer<typeof PublishedVariantSchema>;
