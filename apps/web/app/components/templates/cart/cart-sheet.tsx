import { cn } from "@blazell/ui";
import { Button, buttonVariants } from "@blazell/ui/button";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	DialogContent,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "@blazell/ui/dialog-vaul";
import { Link } from "@remix-run/react";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";
import { LineItem, LineItemSkeleton } from "../line-item/line-item";
import { Total } from "./total-info";

export const CartSheet = ({ cartID }: { cartID: string | null }) => {
	const rep = useReplicache((state) => state.globalRep);
	const isInitialized = useGlobalStore((state) => state.isInitialized);
	const cartMap = useGlobalStore((state) => state.cartMap);
	const cart = cartMap.get(cartID ?? "");
	const items = useGlobalStore((state) =>
		state.lineItems.filter((item) => item.cartID === cartID),
	);
	const [parent] = useAutoAnimate({ duration: 200 });

	const { opened, setOpened } = useCartState();

	const deleteItem = useCallback(
		async (id: string) => {
			await rep?.mutate.deleteLineItem({ id });
		},
		[rep],
	);
	const updateItem = useCallback(
		async (id: string, quantity: number) => {
			await rep?.mutate.updateLineItem({ id, quantity });
		},
		[rep],
	);

	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
			<DialogTrigger asChild>
				<Button variant={"outline"} size={"icon"} className="rounded-lg">
					<Icons.ShoppingCart
						size={20}
						strokeWidth={strokeWidth}
						className="text-slate-11"
					/>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:w-[350px]">
				<DialogTitle className="p-4 border-b border-border  ">Cart</DialogTitle>
				<ScrollArea className="h-[75vh] px-4 pt-2">
					<ul className="flex flex-col gap-2" ref={parent}>
						{!isInitialized &&
							Array.from({ length: 5 }).map((_, i) => (
								<LineItemSkeleton key={i} />
							))}
						{items.length === 0 && (
							<p className="text-slate-11 mt-40 dark:text-white text-center">
								Cart is empty
							</p>
						)}
						{items.map((item) => (
							<LineItem
								lineItem={item}
								key={item.id}
								deleteItem={deleteItem}
								updateItem={updateItem}
								currencyCode={cart?.currencyCode ?? "AUD"}
							/>
						))}
					</ul>
				</ScrollArea>
				<Total
					className="mt-auto px-4 pb-2 border-t border-t-slate-7"
					cartOrOrder={cart}
					lineItems={items}
				/>
				<div className="w-full px-4 pb-4">
					<Link
						to="/checkout"
						prefetch="viewport"
						className={cn(buttonVariants(), "w-full ")}
					>
						Checkout
					</Link>
				</div>
			</DialogContent>
		</DialogRoot>
	);
};
