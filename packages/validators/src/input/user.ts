import { schema } from "@pachi/db";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const UserInsertSchema = createInsertSchema(schema.users);
export type UserInsert = z.infer<typeof UserInsertSchema>;
export const CreateUserSchema = z.object({
	user: UserInsertSchema.pick({
		id: true,
		replicachePK: true,
	}).extend({ username: z.string(), authID: z.string(), email: z.string() }),
	storeID: z.string(),
	countryCode: z.string(),
});
export type CreateUser = z.infer<typeof CreateUserSchema>;
export const UpdateUserSchema = z.object({
	username: z.string().optional(),
	id: z.string(),
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export const UserAuthSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" }),
});
export type UserAuth = z.infer<typeof UserAuthSchema>;
