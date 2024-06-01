import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ShoppingCart } from "lucide-react";
import {
	DialogRoot,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@pachi/ui/dialog-vaul";
import { Total } from "./total-info";
import type {
	Cart,
	LineItem as LineItemType,
} from "@blazell/validators/client";
import { strokeWidth } from "@blazell/ui/icons";
import { useCartState, useMarketplaceState } from "~/zustand/state";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { LineItem, LineItemSkeleton } from "../line-item/line-item";
import { Button, buttonVariants } from "@blazell/ui/button";
import { Link } from "@remix-run/react";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { cn } from "@blazell/ui";

export const CartSheet = ({ cartID }: { cartID: string | null }) => {
	const userRep = useReplicache((state) => state.userRep);
	const isInitialized = useMarketplaceState((state) => state.isInitialized);
	const cart = ReplicacheStore.getByPK<Cart>(userRep, cartID ?? "__");
	const items = ReplicacheStore.scan<LineItemType>(userRep, "line_item");

	items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	const [parent] = useAutoAnimate(/* optional config */);

	const { opened, setOpened } = useCartState();

	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
			<DialogTrigger asChild>
				<Button variant={"ghost"} size={"icon"}>
					<ShoppingCart
						size={20}
						strokeWidth={strokeWidth}
						className="text-mauve-11"
					/>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle className="p-4 border-b border-mauve-7">Cart</DialogTitle>
				<ScrollArea className="h-[75vh] px-4 pt-2">
					<ul className="flex flex-col gap-2" ref={parent}>
						{!isInitialized &&
							Array.from({ length: 5 }).map((_, i) => (
								<LineItemSkeleton key={i} />
							))}
						{items.length === 0 && (
							<p className="text-mauve-11 mt-40 dark:text-white text-center">
								Cart is empty
							</p>
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
				</ScrollArea>
				<Total
					className="mt-auto px-4 pb-2 border-t border-t-mauve-7"
					cartOrOrder={cart}
					lineItems={items}
				/>
				<div className="w-full px-4 pb-4">
					<Link
						to="/checkout"
						prefetch="viewport"
						className={cn(buttonVariants(), "w-full")}
					>
						Checkout
					</Link>
				</div>
			</DialogContent>
		</DialogRoot>
	);
};
