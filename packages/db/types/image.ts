import { base64 } from "@effect/schema/FastCheck";
import { z } from "zod";

// export class Image extends Schema.Class<Image>("Image")({
// 	id: Schema.String,
// 	name: Schema.String,
// 	order: Schema.Number,
// 	url: Schema.optional(Schema.String),
// 	crop: Schema.optional(Schema.Struct({
// 		x: Schema.Number,
// 		y: Schema.Number,
// 		width: Schema.Number,
// 		height: Schema.Number,
// 	})),
// 	base64: Schema.optional(Schema.String),
// 	uploading: Schema.optional(Schema.Boolean),
// }) {
// 	static decodeUnknownSync = decodeUnknownSync(this);
// 	static decodeUnknown = decodeUnknown(this);
// }

export const ImageSchema = z.object({
	id: z.string(),
	name: z.string(),
	order: z.number(),
	uploaded: z.boolean(),
	url: z.string(),
	fileType: z.string(),
	croppedImage: z
		.object({
			id: z.string(),
			url: z.string(),
			base64: z.string().optional(),
			fileType: z.string().optional(),
			uploaded: z.boolean(),
		})
		.optional(),
	base64: z.string().optional(),
});
export type Image = z.infer<typeof ImageSchema>;
