import { z } from "zod";

import { createInsertSchema } from "drizzle-zod";
import { schema } from "@pachi/db";
import { ImageSchema } from "../shared";

const ProductSchema = createInsertSchema(schema.products);
export const PublishedProductSchema = ProductSchema.required({
	title: true,
	description: true,
	handle: true,
	discountable: true,
	quantity: true,
}).extend({
	score: z.number(),
	title: z.string(),
	handle: z.string(),
});
const PriceSchema = createInsertSchema(schema.prices);
export const CreateProductSchema = z.object({
	product: ProductSchema,
});
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export const DeleteInputSchema = z.object({
	id: z.string(),
});
export type DeleteInput = z.infer<typeof DeleteInputSchema>;

const ProductUpdatesSchema = ProductSchema.pick({
	title: true,
	description: true,
	discountable: true,
	status: true,
	quantity: true,
	sku: true,
	barcode: true,
});

export const UpdateProductSchema = z.object({
	updates: ProductUpdatesSchema,
	id: z.string(),
});
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export const UpdateImagesOrderSchema = z.object({
	id: z.string(),
	order: z.record(z.number()),
});
export type UpdateImagesOrder = z.infer<typeof UpdateImagesOrderSchema>;
export const UploadImagesSchema = z.object({
	id: z.string(),
	images: z.array(ImageSchema),
});
export type UploadImages = z.infer<typeof UploadImagesSchema>;
export const UploadStoreImageSchema = z.object({
	id: z.string(),
	image: ImageSchema,
	type: z.enum(["storeImage", "headerImage"] as const),
});
export type UploadStoreImage = z.infer<typeof UploadStoreImageSchema>;
export const DeleteStoreImageSchema = z.object({
	storeID: z.string(),
	imageID: z.string(),
	type: z.enum(["storeImage", "headerImage"] as const),
});
export type DeleteStoreImage = z.infer<typeof DeleteStoreImageSchema>;

export const DeleteImageSchema = z.object({
	imageID: z.string(),
	id: z.string(),
});
export type DeleteImage = z.infer<typeof DeleteImageSchema>;

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

const ProductOptionValueSchema = createInsertSchema(schema.productOptionValues);
export const UpdateProductOptionValuesSchema = z.object({
	productID: z.string(),
	optionID: z.string(),
	newOptionValues: z.array(ProductOptionValueSchema),
});
export type UpdateProductOptionValues = z.infer<
	typeof UpdateProductOptionValuesSchema
>;
export const DeleteProductOptionValueSchema = z.object({
	optionValueID: z.string(),
	productID: z.string(),
});
export type DeleteProductOptionValue = z.infer<
	typeof DeleteProductOptionValueSchema
>;

const VariantSchema = createInsertSchema(schema.variants);
export const CreateVariantSchema = z.object({
	variant: VariantSchema,
});
export type CreateVariant = z.infer<typeof CreateVariantSchema>;
const VariantUpdatesSchema = VariantSchema.pick({
	title: true,
	barcode: true,
	quantity: true,
	metadata: true,
	sku: true,
	weight: true,
	weightUnit: true,
	allowBackorder: true,
});

export const UpdateVariantSchema = z.object({
	id: z.string(),
	updates: VariantUpdatesSchema,
});
export type UpdateVariant = z.infer<typeof UpdateVariantSchema>;
export const DeleteVariantSchema = z.object({
	id: z.string(),
});
export type DeleteVariant = z.infer<typeof DeleteVariantSchema>;
export const CreatePricesSchema = z.object({
	prices: z.array(PriceSchema),
	id: z.string(),
});
export type CreatePrices = z.infer<typeof CreatePricesSchema>;
export const UpdatePriceSchema = z.object({
	priceID: z.string(),
	id: z.string(),
	updates: PriceSchema.pick({ amount: true }),
});
export type UpdatePrice = z.infer<typeof UpdatePriceSchema>;
export const DeletePricesSchema = z.object({
	priceIDs: z.array(z.string()),
	id: z.string(),
});
export type DeletePrices = z.infer<typeof DeletePricesSchema>;
export const AssignOptionValueToVariantSchema = z.object({
	optionValueID: z.string(),
	variantID: z.string(),
	prevOptionValueID: z.string().optional(),
	productID: z.string(),
});
export type AssignOptionValueToVariant = z.infer<
	typeof AssignOptionValueToVariantSchema
>;
