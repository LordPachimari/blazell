import { schema } from "@blazell/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const AddressSchema = createInsertSchema(schema.addresses);

export type InsertAddress = z.infer<typeof AddressSchema>;
export const UpdateAddressSchema = z.object({
	updates: AddressSchema.pick({
		address: true,
		postalCode: true,
		province: true,
		city: true,
	}).extend({
		countryCode: z.string().optional(),
	}),
	id: z.string(),
});
export type UpdateAddress = z.infer<typeof UpdateAddressSchema>;
