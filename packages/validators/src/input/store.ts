import { schema } from "@pachi/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const StoreSchema = createInsertSchema(schema.stores);
export const CreateStoreSchema = z.object({
	store: StoreSchema,
});
export type CreateStore = z.infer<typeof CreateStoreSchema>;
export const StoreUpdates = StoreSchema.pick({
	name: true,
	currencyCodes: true,
	description: true,
})
	.extend({
		name: z
			.string()
			.min(3, { message: "Name must contain at least 3 characters" }),
	})
	.partial();
export const UpdateStoreSchema = z.object({
	updates: StoreUpdates,
	id: z.string(),
});
export type UpdateStore = z.infer<typeof UpdateStoreSchema>;

export const SetActiveStoreIDSchema = z.object({
	id: z.string(),
});
export type SetActiveStoreID = z.infer<typeof SetActiveStoreIDSchema>;
