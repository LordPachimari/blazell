import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";

const sessions = pgTable("sessions", {
	id: varchar("id").primaryKey(),
	userID: varchar("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: varchar("expiresAt").notNull(),
	createdAt: varchar("created_at").notNull(),
});
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userID],
		references: [users.id],
	}),
}));
export { sessions };
