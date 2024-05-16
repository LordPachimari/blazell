"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ShoppingCart } from "lucide-react";
import {
	SheetContent,
	SheetRoot,
	SheetTitle,
	SheetTrigger,
} from "@pachi/ui/sheet";
import { Button } from "@pachi/ui/button";
import { Total } from "./total-info";
import { useReplicache } from "src/zustand/replicache";
import { ReplicacheStore } from "src/replicache/store";
import type { Cart, LineItem } from "@pachi/validators/client";
import { useCartState } from "src/zustand/state";
import { strokeWidth } from "@pachi/ui/icons";

export const CartSheet = ({
	cartID,
}: { cartID: string | null | undefined }) => {
	const userRep = useReplicache((state) => state.userRep);
	const cart = ReplicacheStore.getByID<Cart>(userRep, cartID ?? "");
	const items = ReplicacheStore.scan<LineItem>(userRep, "line_item");
	console.log("cart", cart);

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
