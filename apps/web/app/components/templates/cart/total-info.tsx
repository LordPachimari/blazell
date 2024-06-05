import { cartSubtotal } from "@blazell/utils";
import React from "react";
import { Separator } from "@blazell/ui/separator";
import type { Cart, LineItem, Order } from "@blazell/validators/client";
import { cn } from "@blazell/ui";
import { Effect, pipe } from "effect";
import { toast } from "@blazell/ui/toast";
import Price from "~/components/molecules/price";
export const Total = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		cartOrOrder: Cart | Order | null | undefined;
		lineItems: LineItem[];
	}
>(({ className, cartOrOrder, lineItems, ...props }, ref) => {
	const subtotal = cartOrOrder
		? Effect.runSync(
				cartSubtotal(lineItems, cartOrOrder).pipe(
					Effect.catchTags({
						PriceNotFound: (error) =>
							pipe(
								Effect.succeed(-1),
								Effect.zipLeft(Effect.sync(() => toast.error(error.message))),
							),
					}),
				),
			)
		: 0;
	return (
		<div ref={ref} className={cn("w-full", className)} {...props}>
			<span className="flex w-full text-mauve-11 justify-between my-2">
				<p>Subtotal:</p>

				<Price
					amount={subtotal}
					currencyCode={cartOrOrder?.currencyCode ?? "AUD"}
				/>
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
				<Price
					amount={subtotal}
					currencyCode={cartOrOrder?.currencyCode ?? "AUD"}
				/>
			</span>
		</div>
	);
});
