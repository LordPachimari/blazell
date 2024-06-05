import { Button } from "@blazell/ui/button";
import { generateID } from "@blazell/utils";
import type {
	Product,
	PublishedProduct,
	Variant,
	PublishedVariant,
} from "@blazell/validators/client";
import { useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";

const AddToCart = ({
	cartID,
	variant,
	product,
	isDashboard,
}: {
	cartID?: string;
	variant: PublishedVariant | Variant | undefined;
	product: PublishedProduct | Product | undefined;
	isDashboard?: boolean;
}) => {
	const fetcher = useFetcher();
	const rep = useReplicache((state) => state.globalRep);
	const items = useGlobalStore((state) => state.lineItems);
	const itemsIDs = new Map(items.map((i) => [i.variantID, i]));
	const { setOpened } = useCartState();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const addToCart = useCallback(async () => {
		if (!product || !variant || isDashboard) return;
		const item = itemsIDs.get(variant.id);
		if (item) {
			await rep?.mutate.updateLineItem({
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

		rep?.mutate.createLineItem({
			lineItem: {
				id: newID,
				cartID: cartID ?? newCartID,
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
	}, [cartID, product, variant, rep, isDashboard, itemsIDs, setOpened]);
	return (
		<Button className="w-full max-w-[30rem]" size="lg" onClick={addToCart}>
			Add to Cart
		</Button>
	);
};
export { AddToCart };
