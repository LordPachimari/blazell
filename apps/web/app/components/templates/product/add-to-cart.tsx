import { generateID, generateReplicachePK } from "@blazell/utils";
import { useCallback } from "react";
import { Button } from "@blazell/ui/button";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import type { LineItem, Product, Variant } from "@blazell/validators/client";

const AddToCart = ({
	cartID,
	variant,
	product,
	isDashboard,
}: {
	cartID?: string;
	variant: Variant | null | undefined;
	product: Product | null | undefined;
	isDashboard?: boolean;
}) => {
	const userRep = useReplicache((state) => state.userRep);
	const items = ReplicacheStore.scan<LineItem>(userRep, "line_item");
	const itemsIDs = new Map(items.map((i) => [i.variantID ?? i.productID, i]));
	const { setOpened } = useCartState();
	const addToCart = useCallback(async () => {
		if (!cartID || !product || !variant || isDashboard) return;
		const item = itemsIDs.get(variant.id);
		if (item) {
			await userRep?.mutate.updateLineItem({
				id: item.id,
				quantity: item.quantity + 1,
			});
			return setOpened(true);
		}
		const newID = generateID({ prefix: "line_item" });
		await userRep?.mutate.createLineItem({
			lineItem: {
				id: newID,
				cartID,
				replicachePK: generateReplicachePK({
					id: newID,
					filterID: cartID,
					prefix: "line_item",
				}),
				title: variant.title ?? "",
				quantity: 1,
				createdAt: new Date().toISOString(),
				//@ts-ignore
				variant,
				variantID: variant.id,
				productID: product.id,
				product,
				storeID: product.storeID ?? "",
			},
		});
		return setOpened(true);
	}, [cartID, product, variant, userRep, isDashboard, itemsIDs, setOpened]);
	return (
		<Button className="w-full" size="lg" onClick={addToCart}>
			Add to Cart
		</Button>
	);
};
export { AddToCart };
