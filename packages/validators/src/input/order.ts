import { schema } from "@pachi/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const OrderSchema = createInsertSchema(schema.orders);
export const CreateOrderSchema = z.object({
	order: OrderSchema,
});
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export const UpdateOrderSchema = z.object({
	updates: OrderSchema.pick({
		billingAddressID: true,
		shippingAddressID: true,
		email: true,
		phone: true,
		fullName: true,
	}),
	id: z.string(),
});
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
