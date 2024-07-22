import type { SpaceID, SpaceRecord } from "@blazell/validators";
import {
	createProduct,
	deleteProduct,
	updateProduct,
	publishProduct,
	copyProduct,
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
	deleteVariant,
	duplicateVariant,
	updateVariant,
	generateVariants,
} from "./variant";
import { deleteImage, updateImagesOrder, uploadImages } from "./image";
import { createCart } from "./carts";

const DashboardMutators = {
	createProduct,
	assignOptionValueToVariant,
	createProductOption,
	createPrices,
	generateVariants,
	deleteProduct,
	publishProduct,
	deleteProductOption,
	deleteProductOptionValue,
	deletePrices,
	deleteVariant,
	duplicateVariant,
	updateProduct,
	copyProduct,
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
		global: ["cart"],
	},
	createPrices: {
		dashboard: ["store"],
	},
	generateVariants: {
		dashboard: ["store"],
	},
	deleteProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	publishProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	copyProduct: {
		dashboard: ["store"],
	},
	deleteProductOption: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	deleteProductOptionValue: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	deletePrices: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	deleteVariant: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	duplicateVariant: {
		dashboard: ["store"],
	},
	updateProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	updateImagesOrder: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	updateProductOption: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	updateProductOptionValues: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	updatePrice: {
		dashboard: ["store"],
	},
	updateVariant: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	uploadImages: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
	},
	deleteImage: {
		dashboard: ["store"],
		marketplace: ["products"],
		global: ["cart"],
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
		global: ["user"],
	},
	assignOptionValueToVariant: {
		dashboard: ["store"],
	},
	createLineItem: {
		global: ["cart"],
	},
	updateLineItem: {
		global: ["cart"],
	},
	deleteLineItem: {
		global: ["cart"],
	},
	updateAddress: {
		global: ["cart"],
	},
	updateCart: {
		global: ["cart"],
	},
	deleteStoreImage: {
		dashboard: ["store"],
	},
	setActiveStoreID: {
		dashboard: ["store"],
	},
	createCart: {
		global: ["cart"],
	},
};
