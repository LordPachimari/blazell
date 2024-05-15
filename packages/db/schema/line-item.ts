import { index, integer, json, pgTable, varchar } from "drizzle-orm/pg-core";
import { carts } from "./cart";
import { variants, type Image } from "./variant";
import { products } from "./product";
import { relations } from "drizzle-orm";
import { orders } from "./order";
import { stores } from "./store";

export const lineItems = pgTable(
	"line_items",
	{
		id: varchar("id").notNull().primaryKey(),
		replicachePK: varchar("replicache_pk").notNull(),
		cartID: varchar("cart_id").references(() => carts.id),
		orderID: varchar("order_id").references(() => orders.id),
		thumbnail: json("thumbnail").$type<Image>(),
		title: varchar("title").notNull(),
		variantID: varchar("variant_id").references(() => variants.id),
		productID: varchar("product_id").references(() => products.id),
		createdAt: varchar("created_at").notNull(),
		updatedAt: varchar("updated_at").$onUpdate(() => new Date().toISOString()),
		storeID: varchar("store_id").notNull(),
		quantity: integer("quantity").notNull().default(1),
		total: integer("total"),
		version: integer("version").notNull().default(0),
	},
	(lineItems) => ({
		variantIDIndex: index("variant_id_index_2").on(lineItems.variantID),
		productIDIndex: index("product_id_index_2").on(lineItems.productID),
		cartIDIndex: index("cart_id_index_1").on(lineItems.cartID),
		orderIDIndex: index("order_id_index").on(lineItems.orderID),
		storeIDIndex: index("store_id_index_1").on(lineItems.storeID),
	}),
);

export const lineItemsRelations = relations(lineItems, ({ one }) => ({
	cart: one(carts, {
		fields: [lineItems.cartID],
		references: [carts.id],
	}),
	variant: one(variants, {
		fields: [lineItems.variantID],
		references: [variants.id],
	}),
	product: one(products, {
		fields: [lineItems.productID],
		references: [products.id],
	}),
	order: one(orders, {
		fields: [lineItems.orderID],
		references: [orders.id],
	}),
	store: one(stores, {
		fields: [lineItems.storeID],
		references: [stores.id],
	}),
}));
