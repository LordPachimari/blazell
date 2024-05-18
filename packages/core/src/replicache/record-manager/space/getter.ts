import type { SpaceID, SpaceRecord } from "@pachi/validators";

import { storeCVD } from "./dashboard";
import { userCVD } from "./user";
import { productsCVD } from "./marketplace";
import type { GetRowsWTableName } from "./types";
import { cartCVD } from "./user/cart";
import { ordersCVD } from "./user/orders";

export type SpaceRecordGetterType = {
	[K in SpaceID]: Record<SpaceRecord[K][number], GetRowsWTableName>;
};
export const SpaceRecordGetter: SpaceRecordGetterType = {
	dashboard: {
		store: storeCVD,
	},
	user: {
		user: userCVD,
		cart: cartCVD,
		orders: ordersCVD,
	},
	marketplace: {
		products: productsCVD,
	},
};
