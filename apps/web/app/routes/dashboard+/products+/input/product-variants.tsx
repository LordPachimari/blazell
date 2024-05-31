import { Button } from "@blazell/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { generateID, generateReplicachePK } from "@blazell/utils";
import type { InsertVariant, UpdateVariant } from "@blazell/validators";
import type { ProductOption, Variant } from "@blazell/validators/client";
import { useCallback, useState } from "react";
import { useReplicache } from "~/zustand/replicache";
import VariantTable from "../variant-table/table";
import { ProductOptions } from "./product-options";
import ProductVariant from "./product-variant";

interface ProductVariantsProps {
	options: ProductOption[] | undefined;
	productID: string;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	variants: Variant[];
	defaultVariant: Variant | null | undefined;
	isPublished: boolean;
}
export function Variants({
	options,
	productID,
	updateVariant,
	variants,
	defaultVariant,
	isPublished,
}: ProductVariantsProps) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const [variantID, _setVariantID] = useState<string | null>(null);

	const setVariantID = (id: string | null) => {
		if (id === null) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
		_setVariantID(id);
	};

	const [isOpen, setIsOpen] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const createVariant = useCallback(async () => {
		if (!productID) return;
		const newID = generateID({ prefix: "variant" });
		const newVariant: InsertVariant = {
			id: newID,
			productID,
			replicachePK: generateReplicachePK({
				id: newID,
				prefix: "variant",
				filterID: productID,
			}),
			quantity: 1,
		};
		await dashboardRep?.mutate.createVariant({
			variant: newVariant,
			...(defaultVariant?.prices && { prices: defaultVariant.prices }),
		});

		setVariantID(newID);
		setIsOpen(true);
	}, [dashboardRep, productID, defaultVariant]);
	console.log("isOpen", isOpen);

	const deleteVariant = useCallback(
		async (id: string) => {
			if (dashboardRep) {
				await dashboardRep.mutate.deleteVariant({
					id: id,
				});
			}
		},
		[dashboardRep],
	);

	return (
		<Card className="my-4">
			<CardHeader>
				<CardTitle>
					<span className="flex w-full justify-between">
						Variant<p className="text-sm text-mauve-9">{"(optional)"}</p>
					</span>
				</CardTitle>
				<CardDescription>
					Create variants of your products based on size, colors etc.
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				{productID && (
					<ProductOptions options={options} productID={productID} />
				)}
				<VariantTable
					setVariantID={setVariantID}
					variants={variants ?? []}
					updateVariant={updateVariant}
					deleteVariant={deleteVariant}
				/>
			</CardContent>
			<CardFooter className="justify-center">
				<Button
					size="md"
					variant="ghost"
					type="button"
					className="mt-2 text-mauve-11"
					onClick={createVariant}
				>
					<Icons.plusCircle className="h-3.5 w-3.5 mr-2" />
					Add Variant
				</Button>
				<ProductVariant
					isOpen={isOpen}
					options={options ?? []}
					variantID={variantID}
					setIsOpen={setIsOpen}
					productID={productID}
					setVariantID={setVariantID}
					isPublished={isPublished}
				/>
			</CardFooter>
		</Card>
	);
}
