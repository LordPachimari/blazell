import type { LineItem, Cart, Order } from "@pachi/validators/client";
import type * as Server from "@pachi/validators/server";
export const generateLineItemPrice = (
	lineItem: LineItem,
	currencyCode: string,
) => {
	if (lineItem.variant)
		return (
			lineItem.variant.prices?.find((p) => p.currencyCode === currencyCode)
				?.amount! / 100
		);
	return (
		lineItem.product?.prices?.find((p) => p.currencyCode === currencyCode)
			?.amount! / 100
	);
};

export const cartSubtotal = (
	lineItems: LineItem[],
	cartOrOrder: Cart | Order | Server.Order | Server.Cart | null | undefined,
) => {
	const subtotal =
		lineItems?.reduce((acc, item) => {
			return (
				acc +
				item.quantity *
					generateLineItemPrice(item, cartOrOrder?.currencyCode ?? "AUD")
			);
		}, 0) || 0;
	return subtotal;
};
