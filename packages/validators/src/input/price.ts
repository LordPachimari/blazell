import { schema } from "@blazell/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const PriceSchema = createInsertSchema(schema.prices);
export type InsertPrice = z.infer<typeof PriceSchema>;

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
