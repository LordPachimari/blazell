import { generateID, generateReplicachePK } from "@pachi/utils";
import { useCallback } from "react";
import { Button } from "@pachi/ui/button";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import type {
	LineItem,
	Product,
	PublishedProduct,
	Variant,
} from "@pachi/validators/client";

const AddToCart = ({
	cartID,
	variant,
	product,
	isDashboard,
}: {
	cartID?: string;
	variant?: Variant;
	product: Product | PublishedProduct | null | undefined;
	isDashboard?: boolean;
}) => {
	const userRep = useReplicache((state) => state.userRep);
	const items = ReplicacheStore.scan<LineItem>(userRep, "line_item");
	const itemsIDs = new Map(items.map((i) => [i.variantID ?? i.productID, i]));
	const { setOpened } = useCartState();
	const addToCart = useCallback(async () => {
		if (isDashboard) return;
		const item = itemsIDs.get(variant?.id ?? product?.id ?? "");
		if (item) {
			await userRep?.mutate.updateLineItem({
				id: item.id,
				quantity: item.quantity + 1,
			});
			return setOpened(true);
		}
		const newID = generateID({ prefix: "line_item" });
		if (cartID) {
			await userRep?.mutate.createLineItem({
				lineItem: {
					id: newID,
					cartID,
					replicachePK: generateReplicachePK({
						id: newID,
						filterID: cartID,
						prefix: "line_item",
					}),
					title: variant
						? variant.title ?? product?.title ?? ""
						: product?.title ?? "",
					quantity: 1,
					createdAt: new Date().toISOString(),
					thumbnail: variant ? variant.images?.[0] : product?.images?.[0],
					...(variant && { variantID: variant.id, variant }),
					...(!variant && { productID: product?.id }),
					...(product && { product }),
					storeID: product?.storeID ?? "",
				},
			});
			return setOpened(true);
		}
	}, [cartID, product, variant, userRep, isDashboard, itemsIDs, setOpened]);
	return (
		<Button className="w-full" size="lg" onClick={addToCart}>
			Add to Cart
		</Button>
	);
};
export { AddToCart };
