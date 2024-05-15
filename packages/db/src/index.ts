import { drizzle } from "drizzle-orm/neon-serverless";
// import postgres from "postgres";
import * as schema from "../schema";
import { Pool } from "@neondatabase/serverless";
export * as schema from "../schema";
export * from "../table-name";

const tableName = [
	"users",
	"products",
	"variants",
	"productOptions",
	"productOptionValues",
	"tags",
	"collections",
	"productsToTags",
	"prices",
	"stores",
	"productOptionValuesToVariants",
	"json",
	"carts",
	"lineItems",
	"addresses",
	"orders",
] as const;

export const client = new Pool();
export const db = drizzle(client, { schema });

export type TableName = (typeof tableName)[number];
export type Db = typeof db;
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
