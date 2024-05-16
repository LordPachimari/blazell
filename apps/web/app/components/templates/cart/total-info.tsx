import { cartSubtotal } from "@pachi/utils";
import React from "react";
import { Separator } from "@pachi/ui/separator";
import type { Cart, LineItem, Order } from "@pachi/validators/client";
import { cn } from "@pachi/ui";
export const Total = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		cartOrOrder: Cart | Order | null | undefined;
		lineItems: LineItem[];
	}
>(({ className, cartOrOrder, lineItems, ...props }, ref) => {
	const subtotal = cartSubtotal(lineItems, cartOrOrder);
	return (
		<div ref={ref} className={cn("w-full", className)} {...props}>
			<span className="flex w-full text-mauve-11 justify-between my-2">
				<p>Subtotal:</p>
				<p>{`${cartOrOrder?.currencyCode} ${subtotal}`}</p>
			</span>

			<span className="flex w-full text-mauve-11 justify-between my-2">
				<p>Shipping:</p>
				<p>0</p>
			</span>

			<span className="flex w-full text-mauve-11 justify-between my-2">
				<p>Taxes:</p>
				<p>0</p>
			</span>
			<Separator className="my-2" />

			<span className="flex font-bold w-full justify-between mt-4">
				<p>Total:</p>
				<p>{`${cartOrOrder?.currencyCode} ${subtotal}`}</p>
			</span>
		</div>
	);
});
