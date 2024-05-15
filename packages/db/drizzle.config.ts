import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: "../../.env",
});

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
	schema: "./schema",
	verbose: true,

	// schema: "./schema",
	// driver: "pg",

	// out: "./migrations",
	// dbCredentials:
	// 	connectionString: `${process.env.DATABASE_URL}`,,

	// tablesFilter: ["t3turbo_*"],
	// strict: true,
	// verbose: true,
});
