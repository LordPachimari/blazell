import { schema } from "@blazell/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const InsertUserSchema = createInsertSchema(schema.users).extend({
	authID: z.string(),
});
export type InsertUser = z.infer<typeof InsertUserSchema>;
export const CreateUserSchema = z.object({
	user: InsertUserSchema.pick({
		fullName: true,
	}).extend({
		username: z.string(),
		authID: z.string(),
		email: z.string(),
	}),
	countryCode: z.string(),
});
export type CreateUser = z.infer<typeof CreateUserSchema>;
export const UserUpdatesSchema = InsertUserSchema.pick({
	username: true,
	description: true,
});
export const UpdateUserSchema = z.object({
	updates: UserUpdatesSchema.partial(),
	id: z.string(),
});
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
