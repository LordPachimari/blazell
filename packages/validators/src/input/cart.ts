import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ShippingAddressSchema } from "./form";
import { schema } from "@pachi/db";

const CartSchema = createInsertSchema(schema.carts);
export const CreateCartSchema = z.object({
	cart: CartSchema,
});
export type CreateCart = z.infer<typeof CreateCartSchema>;
export const UpdateCartSchema = z.object({
	updates: CartSchema.pick({
		billingAddressID: true,
		shippingAddressID: true,
		email: true,
		phone: true,
		fullName: true,
	}).extend({
		countryCode: z.string().optional(),
		shippingAddress: ShippingAddressSchema.optional(),
	}),
	id: z.string(),
});
export type UpdateCart = z.infer<typeof UpdateCartSchema>;
