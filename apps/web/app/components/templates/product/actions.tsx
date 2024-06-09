import { Button } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import { generateID } from "@blazell/utils";
import type {
	Product,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazell/validators/client";
import { useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { useCartState } from "~/zustand/state";
import { useGlobalStore } from "~/zustand/store";

const Actions = ({
	cartID,
	defaultVariant,
	variants,
	selectedVariant,
	product,
	isDashboard,
	setIsShaking,
}: {
	cartID?: string;
	selectedVariant: PublishedVariant | Variant | undefined;
	defaultVariant: PublishedVariant | Variant | undefined;
	variants: (PublishedVariant | Variant)[];
	product: PublishedProduct | Product | undefined;
	isDashboard?: boolean;
	setIsShaking: (value: boolean) => void;
}) => {
	const fetcher = useFetcher();
	const rep = useReplicache((state) => state.globalRep);
	const items = useGlobalStore((state) => state.lineItems);
	const itemsIDs = new Map(items.map((i) => [i.variantID, i]));
	const { setOpened } = useCartState();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const addToCart = useCallback(async () => {
		if (!product || !defaultVariant || isDashboard) return;
		if (variants.length > 0 && !selectedVariant) {
			setIsShaking(true);
			setTimeout(setIsShaking, 250);

			return;
		}
		const variant = selectedVariant ?? defaultVariant;
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

		await rep?.mutate.createLineItem({
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
	}, [cartID, product, defaultVariant, rep, isDashboard, itemsIDs, setOpened]);

	const variant = selectedVariant ?? defaultVariant;
	return (
		<div className="w-full py-6 pt-4 flex gap-4 items-center border-b border-mauve-7">
			<SaveToBookmarks />
			<Button
				className="max-w-[30rem] w-[170px] rounded-lg"
				size="lg"
				onClick={addToCart}
			>
				<Icons.ShoppingCart size={25} className="pr-2" />
				Add to Cart
			</Button>
			<Select defaultValue="1">
				<SelectTrigger className="w-[70px] rounded-lg bg-component dark:bg-transparent  ">
					<SelectValue defaultValue="1" />
				</SelectTrigger>
				<SelectContent side="bottom" className="w-14 rounded-lg ">
					{Array.from({ length: variant?.quantity ?? 1 }).map((_, index) => (
						<SelectItem
							key={`${variant?.id}-${index}`}
							value={(index + 1).toString()}
							className="w-14 flex justify-center rounded-none	"
						>
							{index + 1}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
const SaveToBookmarks = () => {
	return (
		<ToggleGroup type="single">
			<ToggleGroupItem value="save" className="w-full text-sm flex gap-2">
				<Icons.Bookmark size={20} />
				Add to bookmarks
			</ToggleGroupItem>
		</ToggleGroup>
	);
};
export { Actions };
