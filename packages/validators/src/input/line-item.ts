import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { schema } from "@pachi/db";
import { ImageSchema } from "../shared";

const LineItemSchema = createInsertSchema(schema.lineItems);
export const CreateLineItemSchema = z.object({
	lineItem: LineItemSchema.extend({
		thumbnail: ImageSchema.optional(),
	}),
});
export const UpdateLineItemSchema = LineItemSchema.pick({
	quantity: true,
	id: true,
});

export type CreateLineItem = z.infer<typeof CreateLineItemSchema>;
export type UpdateLineItem = z.infer<typeof UpdateLineItemSchema>;
