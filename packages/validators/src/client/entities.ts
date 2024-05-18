// TYPE DEFINITIONS FOR CLIENT (INDEXEDB)
import type * as Server from "../server/entities";
import type { Image } from "../shared";
export type Variant = Omit<Server.Variant, "images"> & {
	product?: Product;
	prices?: Server.Price[];
	images?: Image[] | undefined;
	optionValues?: Array<{
		optionValue: ProductOptionValue & { option: ProductOption };
	}>;
};

export type InsertVariant = Server.InsertVariant & {
	prices: InsertPrice[];
};
export type Product = Omit<Server.Product, "thumbnail" | "images"> & {
	variants?: Variant[];
	options?: ProductOption[];
	thumbnail?: Image;
	collection: Server.Collection;
	prices?: Server.Price[];
	images?: Image[];
};

export type PublishedProduct = Omit<
	Server.PublishedProduct,
	"thumbnail" | "images"
> & {
	variants?: Variant[];
	options?: ProductOption[];
	thumbnail?: Image;
	collection: Server.Collection;
	prices?: Server.Price[];
	images?: Image[];
};

export type ProductOption = Server.ProductOption & {
	optionValues?: ProductOptionValue[];
};
export type InsertProductOption = Server.InsertProductOption;
export type Store = Server.Store & {
	products?: Product[];
	founder?: Server.User;
};
export type InsertStore = Server.InsertStore;
export type InsertUser = Server.InsertUser;
export type Price = Server.Price;
export type InsertPrice = Server.InsertPrice;
export type ProductOptionValue = Server.ProductOptionValue;
export type InsertProductOptionValue = Server.InsertProductOptionValue;
export type User = Server.User;
export type Customer = Pick<
	User,
	"id" | "fullName" | "username" | "email" | "phone"
>;
export type Address = Server.Address;
export type ActiveStoreID = Server.ActiveStoreID;
export type LineItem = Server.LineItem & {
	variant?: Variant;
	product?: Product;
};

export type Cart = Server.Cart & {
	shippingAddress: Address;
	billingAddress?: Address;
};

export type Order = Server.Order & {
	user?: User;
	shippingAddress?: Address;
	billingAddress?: Address;
};
