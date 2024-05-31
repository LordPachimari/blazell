import { generateID, generateReplicachePK } from "@blazell/utils";
import { useCallback } from "react";
import { Button } from "@blazell/ui/button";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import type { LineItem, Product, Variant } from "@blazell/validators/client";
import { useFetcher } from "@remix-run/react";
import { useAuth } from "@clerk/remix";

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
	const fetcher = useFetcher();
	const userRep = useReplicache((state) => state.userRep);
	const items = ReplicacheStore.scan<LineItem>(userRep, "line_item");
	const itemsIDs = new Map(items.map((i) => [i.variantID, i]));
	const { setOpened } = useCartState();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const addToCart = useCallback(async () => {
		if (!product || !variant || isDashboard) return;
		const item = itemsIDs.get(variant.id);
		if (item) {
			await userRep?.mutate.updateLineItem({
				id: item.id,
				quantity: item.quantity + 1,
			});
			return setOpened(true);
		}
		const newID = generateID({ prefix: "line_item" });
		const newCartID = generateID({ prefix: "cart" });

		if (!cartID) {
			fetcher.submit(
				{ cartID: newCartID },
				{ method: "POST", action: "/action/set-cart-id", navigate: false },
			);
		}

		userRep?.mutate.createLineItem({
			lineItem: {
				id: newID,
				cartID: cartID ?? newCartID,
				replicachePK: generateReplicachePK({
					id: newID,
					filterID: cartID ?? newCartID,
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
			...(!cartID && {
				newCartID,
			}),
		});

		return setOpened(true);
	}, [cartID, product, variant, userRep, isDashboard, itemsIDs, setOpened]);
	return (
		<Button className="w-full max-w-[30rem]" size="lg" onClick={addToCart}>
			Add to Cart
		</Button>
	);
};
export { AddToCart };
