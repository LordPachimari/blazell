import type { SpaceID, SpaceRecord } from "@pachi/validators";
import {
	assignOptionValueToVariant,
	createProduct,
	createProductOption,
	createPrices,
	createVariant,
	deleteProduct,
	deleteProductOption,
	deleteProductOptionValue,
	deletePrices,
	deleteVariant,
	updateProduct,
	updateImagesOrder,
	updateProductOption,
	updateProductOptionValues,
	updatePrice,
	updateVariant,
	uploadImages,
	deleteImage,
	publishProduct,
} from "./product";
import {
	createStore,
	deleteStoreImage,
	setActiveStoreID,
	updateStore,
	uploadStoreImage,
} from "./store";
import { createUser, updateUser } from "./user";
import { createLineItem, deleteLineItem, updateLineItem } from "./line-item";
import { updateAddress } from "./address";
import { updateCart } from "./cart";
import { createOrder } from "./order";

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
	updateProduct,
	updateImagesOrder,
	updateProductOption,
	updateProductOptionValues,
	updatePrice,
	updateVariant,
	uploadImages,
	deleteImage,
	setActiveStoreID,
	createStore,
	updateStore,
	createOrder,
	uploadStoreImage,
	deleteStoreImage,
};

export const DashboardMutatorsMap = new Map(Object.entries(DashboardMutators));
export type DashboardMutatorsType = typeof DashboardMutators;
export type DashboardMutatorsMapType = typeof DashboardMutatorsMap;
export const UserMutators = {
	createUser,
	updateUser,
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
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
	},
	createPrices: {
		dashboard: ["store"],
	},
	createVariant: {
		dashboard: ["store"],
	},
	deleteProduct: {
		dashboard: ["store"],
	},
	publishProduct: {
		dashboard: ["store"],
		marketplace: ["products"],
	},
	deleteProductOption: {
		dashboard: ["store"],
	},
	deleteProductOptionValue: {
		dashboard: ["store"],
	},
	deletePrices: {
		dashboard: ["store"],
	},
	deleteVariant: {
		dashboard: ["store"],
	},
	updateProduct: {
		dashboard: ["store"],
	},
	updateImagesOrder: {
		dashboard: ["store"],
	},
	updateProductOption: {
		dashboard: ["store"],
	},
	updateProductOptionValues: {
		dashboard: ["store"],
	},
	updatePrice: {
		dashboard: ["store"],
	},
	updateVariant: {
		dashboard: ["store"],
	},
	uploadImages: {
		dashboard: ["store"],
	},
	deleteImage: {
		dashboard: ["store"],
	},
	setActiveStoreID: {
		dashboard: ["store"],
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
	createUser: {
		user: ["user"],
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
	uploadStoreImage: {
		dashboard: ["store"],
	},
	deleteStoreImage: {
		dashboard: ["store"],
	},
};
