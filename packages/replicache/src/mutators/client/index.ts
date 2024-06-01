import type { WriteTransaction } from "replicache";

import type { Server } from "..";
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
import { createCart, updateCart } from "./cart";
import { createOrder } from "./order";
import {
	assignOptionValueToVariant,
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
import {
	deleteProductOptionValue,
	updateProductOptionValues,
} from "./product-option-value";
import { deleteImage, updateImagesOrder, uploadImages } from "./image";

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
	duplicateProduct,
	createProductOption,
	updateProductOption,
	deleteProductOption,
	assignOptionValueToVariant,
	createPrices,
	deletePrices,
	createVariant,
	updateVariant,
	deleteVariant,
	duplicateVariant,
	deleteProductOptionValue,
	updateImagesOrder,
	updateProductOptionValues,
	updatePrice,
	uploadImages,
	deleteImage,
	createStore,
	updateStore,
	createOrder,
	deleteStoreImage,
	setActiveStoreID,
};
export type UserMutatorsType = {
	[key in keyof Server.UserMutatorsType]: (
		ctx: WriteTransaction,
		args: Parameters<Server.UserMutatorsType[key]>[0],
	) => Promise<void>;
};
export const UserMutators: UserMutatorsType = {
	updateUser,
	createLineItem,
	updateLineItem,
	deleteLineItem,
	updateAddress,
	updateCart,
	createCart,
};
