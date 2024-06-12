import { SelectSeparator } from "@blazell/ui/select";
import type {
	Cart,
	LineItem as LineItemType,
} from "@blazell/validators/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useCallback } from "react";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { useReplicache } from "~/zustand/replicache";

export const CartInfo = ({
	cart,
	items,
}: { cart: Cart | null | undefined; items: LineItemType[] }) => {
	const rep = useReplicache((state) => state.globalRep);
	const [parent] = useAutoAnimate(/* optional config */);
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
		<section>
			<h1 className="text-xl text-mauve-10 my-2">In your Cart</h1>
			<SelectSeparator className="my-2" />
			<ul ref={parent} className="flex flex-col gap-2">
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
			<Total className="mt-auto" cartOrOrder={cart} lineItems={items || []} />
		</section>
	);
};
