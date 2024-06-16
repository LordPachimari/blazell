import { ImageSchema, schema } from "@blazell/db";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { UpdateImagesOrderSchema } from "./image";
import { InsertPriceSchema, PriceSchema } from "./price";

export const InsertVariantSchema = createInsertSchema(schema.variants);

export const VariantSchema = createSelectSchema(schema.variants).extend({
	thumbnail: ImageSchema.optional(),
	images: z.array(ImageSchema).optional(),
});
export type InsertVariant = z.infer<typeof InsertVariantSchema>;
export const CreateVariantSchema = z.object({
	variant: InsertVariantSchema,
	prices: z.array(InsertPriceSchema).optional(),
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
	description: true,
})
	.partial()
	.extend({
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
}).extend({
	prices: z.array(PriceSchema),
});
export type PublishedVariant = z.infer<typeof PublishedVariantSchema>;
export const VariantDuplicateSchema = z.object({
	originalVariantID: z.string(),
	newVariantID: z.string(),
	newPriceIDs: z.array(z.string()),
});
export type VariantDuplicate = z.infer<typeof VariantDuplicateSchema>;
export const DuplicateVariantSchema = z.object({
	duplicates: z.array(VariantDuplicateSchema),
});
export type DuplicateVariant = z.infer<typeof DuplicateVariantSchema>;
