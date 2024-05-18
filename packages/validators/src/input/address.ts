import { schema } from "@pachi/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const AddressSchema = createInsertSchema(schema.addresses);
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
