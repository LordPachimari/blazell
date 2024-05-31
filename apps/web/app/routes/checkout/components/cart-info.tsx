import { SelectSeparator } from "@blazell/ui/select";
import type {
	Cart,
	LineItem as LineItemType,
} from "@blazell/validators/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";

export const CartInfo = ({ cart }: { cart: Cart | null | undefined }) => {
	const userRep = useReplicache((state) => state.userRep);
	const items = ReplicacheStore.scan<LineItemType>(userRep, "line_item");
	items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	const [parent] = useAutoAnimate(/* optional config */);
	return (
		<section>
			<h1 className="text-xl text-mauve-10 my-2">In your Cart</h1>
			<SelectSeparator className="my-2" />
			<ul ref={parent} className="flex flex-col gap-2">
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
		</section>
	);
};
