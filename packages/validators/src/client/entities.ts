// TYPE DEFINITIONS FOR CLIENT.
import type { Image } from "@blazell/db";
import type * as Server from "../server/entities";
export type Variant = Server.Variant & {
	product?: Product;
	prices?: Server.Price[];
	optionValues?: Array<{
		optionValue: ProductOptionValue & { option: ProductOption };
	}>;
	images: Image[];
};
export type PublishedVariant = Variant & {
	product: PublishedProduct;
	prices: Price[];
	optionValues: ProductOptionValue[];
	images: Image[];
};

export type Product = Server.Product & {
	variants?: Variant[];
	options?: ProductOption[];
	collection: Server.Collection;
	defaultVariant: Variant;
};
export type PublishedProduct = Server.Product & {
	variants: Variant[];
	options: ProductOption[];
	collection: Server.Collection;
	defaultVariant: PublishedVariant;
};

export type ProductOption = Server.ProductOption & {
	optionValues?: ProductOptionValue[];
};
export type Store = Server.Store & {
	products: Product[];
	founder?: Server.User;
};
export type Price = Server.Price;
export type ProductOptionValue = Server.ProductOptionValue;
export type User = Server.User;
export type Customer = Pick<
	User,
	"id" | "fullName" | "username" | "email" | "phone"
>;
export type Address = Server.Address;
export type LineItem = Server.LineItem & {
	variant: PublishedVariant;
	product?: PublishedProduct;
};

export type Cart = Server.Cart & {
	shippingAddress?: Address;
	billingAddress?: Address;
};

export type Order = Server.Order & {
	user?: User;
	shippingAddress?: Address;
	billingAddress?: Address;
};
