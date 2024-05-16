import type { schema } from "@pachi/db";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import type { Image } from "../shared";
import type { PublishedProductSchema } from "../input/product";

export type Store = InferSelectModel<typeof schema.stores>;
export type InsertStore = InferInsertModel<typeof schema.stores>;
export type User = InferSelectModel<typeof schema.users>;
export type InsertUser = InferInsertModel<typeof schema.users> & {
	email: string;
	username: string;
	authID: string;
};
export type Address = InferSelectModel<typeof schema.addresses>;
export type InsertAddress = InferInsertModel<typeof schema.addresses>;
export type Price = InferSelectModel<typeof schema.prices>;
export type InsertPrice = InferInsertModel<typeof schema.prices>;
export type Collection = InferSelectModel<typeof schema.collections>;
export type ProductOption = InferSelectModel<typeof schema.productOptions>;
export type InsertProductOption = InferInsertModel<
	typeof schema.productOptions
>;
export type ProductOptionValue = InferSelectModel<
	typeof schema.productOptionValues
>;
export type InsertProductOptionValue = InferInsertModel<
	typeof schema.productOptionValues
>;
export type Tag = InferSelectModel<typeof schema.tags>;
export type Variant = InferSelectModel<typeof schema.variants>;
export type InsertVariant = InferInsertModel<typeof schema.variants>;
export type Product = InferSelectModel<typeof schema.products>;
export type Cart = InferSelectModel<typeof schema.carts>;
export type InsertCart = InferInsertModel<typeof schema.carts>;
export type LineItem = Omit<
	InferSelectModel<typeof schema.lineItems>,
	"thumbnail"
> & {
	thumbnail: Image | null;
};
export type Order = InferSelectModel<typeof schema.orders>;
export type InsertOrder = InferInsertModel<typeof schema.orders>;
export type PublishedProduct = z.infer<typeof PublishedProductSchema>;

export type ActiveStoreID = {
	id: "active_store_id";
	replicachePK: "active_store_id";
	value: {
		storeID: string;
	};
};
