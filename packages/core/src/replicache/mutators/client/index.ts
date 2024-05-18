import type { WriteTransaction } from "replicache";

import type { Server } from "..";
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

export type DashboardMutatorsType = {
	[key in keyof Server.DashboardMutatorsType]: (
		tx: WriteTransaction,
		args: Parameters<Server.DashboardMutatorsType[key]>[0],
	) => Promise<void>;
};
export const DashboardMutators: DashboardMutatorsType = {
	createProduct,
	updateProduct,
	deleteProduct,
	publishProduct,
	createProductOption,
	updateProductOption,
	deleteProductOption,
	assignOptionValueToVariant,
	createPrices,
	deletePrices,
	createVariant,
	updateVariant,
	deleteVariant,
	deleteProductOptionValue,
	updateImagesOrder,
	updateProductOptionValues,
	updatePrice,
	uploadImages,
	deleteImage,
	createStore,
	setActiveStoreID,
	updateStore,
	createOrder,
	uploadStoreImage,
	deleteStoreImage,
};
export type UserMutatorsType = {
	[key in keyof Server.UserMutatorsType]: (
		ctx: WriteTransaction,
		args: Parameters<Server.UserMutatorsType[key]>[0],
	) => Promise<void>;
};
export const UserMutators: UserMutatorsType = {
	createUser,
	updateUser,
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
};
