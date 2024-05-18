import { z } from "zod";

export const ImageSchema = z.object({
	id: z.string(),
	name: z.string(),
	order: z.number(),
	url: z.string().optional(),
	preview: z.string().optional(),
	croppedUrl: z.string().optional(),
});
export type Image = z.infer<typeof ImageSchema>;
export type FileType = (File & { preview?: string }) &
	Omit<Image, "url"> & { url?: string };
