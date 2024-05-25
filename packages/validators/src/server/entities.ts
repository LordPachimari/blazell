import type { Image, schema } from "@blazell/db";

import type { InferSelectModel } from "drizzle-orm";

export type Store = InferSelectModel<typeof schema.stores>;
export type User = InferSelectModel<typeof schema.users>;
export type Address = InferSelectModel<typeof schema.addresses>;
export type Price = InferSelectModel<typeof schema.prices>;
export type Collection = InferSelectModel<typeof schema.collections>;
export type ProductOption = InferSelectModel<typeof schema.productOptions>;
export type ProductOptionValue = InferSelectModel<
	typeof schema.productOptionValues
>;
export type Tag = InferSelectModel<typeof schema.tags>;
export type Variant = InferSelectModel<typeof schema.variants>;
export type Product = InferSelectModel<typeof schema.products>;
export type Cart = InferSelectModel<typeof schema.carts>;
export type LineItem = InferSelectModel<typeof schema.lineItems>;
export type Order = InferSelectModel<typeof schema.orders>;
export type ClientError = InferSelectModel<typeof schema.clientErrors>;
