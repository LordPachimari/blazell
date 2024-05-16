"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ShoppingCart } from "lucide-react";
import {
	SheetContent,
	SheetRoot,
	SheetTitle,
	SheetTrigger,
} from "@pachi/ui/sheet";
import { Total } from "./total-info";
import type { Cart, LineItem as LineItemType } from "@pachi/validators/client";
import { strokeWidth } from "@pachi/ui/icons";
import { useCartState } from "~/zustand/state";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { LineItem } from "../line-item/line-item";
import { Button } from "@pachi/ui/button";

export const CartSheet = ({
	cartID,
}: { cartID: string | null | undefined }) => {
	const userRep = useReplicache((state) => state.userRep);
	const cart = ReplicacheStore.getByID<Cart>(userRep, cartID ?? "");
	const items = ReplicacheStore.scan<LineItemType>(userRep, "line_item");

	items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	const [parent] = useAutoAnimate(/* optional config */);

	const { opened, setOpened } = useCartState();

	return (
		<SheetRoot open={opened} onOpenChange={setOpened}>
			<SheetTrigger asChild>
				<Button variant={"ghost"} size={"icon"}>
					<ShoppingCart
						size={20}
						strokeWidth={strokeWidth}
						className="text-mauve-11"
					/>
				</Button>
			</SheetTrigger>
			<SheetContent className="flex flex-col ">
				<SheetTitle>Cart</SheetTitle>
				<ul className="flex flex-col gap-2" ref={parent}>
					{items.length === 0 && (
						<p className="text-mauve-11 text-center">Cart is empty</p>
					)}
					{items.map((item) => (
						<LineItem
							lineItem={item}
							key={item.id}
							deleteItem={async (id: string) =>
								await userRep?.mutate.deleteLineItem({ id })
							}
							updateItem={async (id: string, quantity: number) =>
								await userRep?.mutate.updateLineItem({ id, quantity })
							}
							currencyCode={cart?.currencyCode ?? "AUD"}
						/>
					))}
				</ul>
				<Total className="mt-auto" cartOrOrder={cart} lineItems={items || []} />
				<Button href="/checkout">Checkout</Button>
			</SheetContent>
		</SheetRoot>
	);
};
