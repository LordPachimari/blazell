import type { SpaceID, SpaceRecord } from "@blazell/validators";
import {
	createProduct,
	deleteProduct,
	updateProduct,
	publishProduct,
	duplicateProduct,
} from "./product";
import {
	createStore,
	deleteStoreImage,
	setActiveStoreID,
	updateStore,
} from "./store";
import { updateUser } from "./user";
import { createLineItem, deleteLineItem, updateLineItem } from "./line-item";
import { updateAddress } from "./address";
import { updateCart } from "./cart";
import { createOrder } from "./order";
import {
	assignOptionValueToVariant,
	deleteProductOptionValue,
	updateProductOptionValues,
} from "./product-option-value";
import {
	createProductOption,
	deleteProductOption,
	updateProductOption,
} from "./product-option";
import { createPrices, deletePrices, updatePrice } from "./price";
import {
	createVariant,
	deleteVariant,
	duplicateVariant,
	updateVariant,
} from "./variant";
import { deleteImage, updateImagesOrder, uploadImages } from "./image";
import { createCart } from "./carts";

const DashboardMutators = {
	createProduct,
	assignOptionValueToVariant,
	createProductOption,
	createPrices,
	createVariant,
	deleteProduct,
	publishProduct,
	deleteProductOption,
	deleteProductOptionValue,
	deletePrices,
	deleteVariant,
	duplicateVariant,
	updateProduct,
	duplicateProduct,
	updateImagesOrder,
	updateProductOption,
	updateProductOptionValues,
	updatePrice,
	updateVariant,
	uploadImages,
	deleteImage,
	createStore,
	updateStore,
	createOrder,
	setActiveStoreID,
	deleteStoreImage,
};

export const DashboardMutatorsMap = new Map(Object.entries(DashboardMutators));
export type DashboardMutatorsType = typeof DashboardMutators;
export type DashboardMutatorsMapType = typeof DashboardMutatorsMap;
export const UserMutators = {
	updateUser,
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
	createCart,
};
export const UserMutatorsMap = new Map(Object.entries(UserMutators));
export type UserMutatorsType = typeof UserMutators;
export type UserMutatorsMapType = typeof UserMutatorsMap;

type MutatorKeys = keyof DashboardMutatorsType | keyof UserMutatorsType;
//affected spaces and its subspaces
export type AffectedSpaces = Record<
	MutatorKeys,
	Partial<Record<SpaceID, SpaceRecord[SpaceID]>>
>;

export const affectedSpaces: AffectedSpaces = {
	createProduct: {
		dashboard: ["store"],
	},
	createProductOption: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	createPrices: {
		dashboard: ["store"],
	},
	createVariant: {
		dashboard: ["store"],
	},
	deleteProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	publishProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	duplicateProduct: {
		dashboard: ["store"],
	},
	deleteProductOption: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	deleteProductOptionValue: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	deletePrices: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	deleteVariant: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	duplicateVariant: {
		dashboard: ["store"],
	},
	updateProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	updateImagesOrder: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	updateProductOption: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	updateProductOptionValues: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	updatePrice: {
		dashboard: ["store"],
	},
	updateVariant: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	uploadImages: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	deleteImage: {
		dashboard: ["store"],
		marketplace: ["products"],
		user: ["cart"],
	},
	createStore: {
		dashboard: ["store"],
	},
	updateStore: {
		dashboard: ["store"],
	},
	createOrder: {
		dashboard: ["store"],
	},
	updateUser: {
		user: ["user"],
	},
	assignOptionValueToVariant: {
		dashboard: ["store"],
	},
	createLineItem: {
		user: ["cart"],
	},
	updateLineItem: {
		user: ["cart"],
	},
	deleteLineItem: {
		user: ["cart"],
	},
	updateAddress: {
		user: ["cart"],
	},
	updateCart: {
		user: ["cart"],
	},
	deleteStoreImage: {
		dashboard: ["store"],
	},
	setActiveStoreID: {
		dashboard: ["store"],
	},
	createCart: {
		user: ["cart"],
	},
};
