import { z } from "zod";
import { Schema } from "@effect/schema";
import { ImageSchema } from "@blazell/db";

export const UpdateImagesOrderSchema = z.object({
	entityID: z.string(),
	order: z.record(z.number()),
});
export type UpdateImagesOrder = z.infer<typeof UpdateImagesOrderSchema>;
export const UploadImagesSchema = z.object({
	entityID: z.string(),
	images: z.array(ImageSchema),
});
export type UploadImages = z.infer<typeof UploadImagesSchema>;

export const DeleteImageSchema = z.object({
	cloudflareID: z.string().optional(),
	imageID: z.string(),
	entityID: z.string(),
});
export type DeleteImage = z.infer<typeof DeleteImageSchema>;

export const UploadResponseSchema = Schema.Struct({
	result: Schema.Union(
		Schema.Struct({
			variants: Schema.Array(Schema.String),
			filename: Schema.String,
			id: Schema.String,
		}),
		Schema.Null,
	),
	success: Schema.Boolean,
	errors: Schema.Array(
		Schema.Struct({
			message: Schema.String,
			code: Schema.Number,
		}),
	),
});