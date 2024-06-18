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
import { generateID } from "@blazell/utils";
import type { Product, Variant } from "@blazell/validators/client";
import { useCallback, useState } from "react";
import { useReplicache } from "~/zustand/replicache";
import VariantTable from "../variant-table/table";
import { ProductOptions } from "./product-options";
import ProductVariant from "./product-variant";

interface ProductVariantsProps {
	productID: string;
	product: Product | undefined;
	variants: Variant[];
	defaultVariant: Variant | null | undefined;
	isPublished: boolean;
}
export function Variants({
	productID,
	product,
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

	const generateVariants = useCallback(async () => {
		if (!product) return;
		await dashboardRep?.mutate.generateVariants({
			productID,
			newVariantIDs: Array.from({
				length: (product?.options?.length ?? 0) * 10,
			}).map(() => generateID({ prefix: "variant" })),
			newPricesIDs: Array.from({
				length: (defaultVariant?.prices ?? []).length ?? 1,
			}).map(() => generateID({ prefix: "price" })),
			...(defaultVariant?.prices && {
				prices: defaultVariant.prices.map((p) => ({
					...p,
					id: generateID({ prefix: "price" }),
					variantID: "whatever",
				})),
			}),
		});
	}, [dashboardRep, productID, product, defaultVariant]);

	const deleteVariant = useCallback(
		async (keys: string[]) => {
			if (dashboardRep) {
				await dashboardRep.mutate.deleteVariant({
					keys,
				});
			}
		},
		[dashboardRep],
	);
	const duplicateVariant = useCallback(
		async (keys: string[]) => {
			if (dashboardRep) {
				await dashboardRep.mutate.duplicateVariant({
					duplicates: keys.map((id) => ({
						newPriceIDs: Array.from({ length: 1 }).map(() =>
							generateID({ prefix: "price" }),
						),
						newVariantID: generateID({ prefix: "variant" }),
						originalVariantID: id,
					})),
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
				<ProductOptions
					options={product?.options ?? []}
					productID={productID}
				/>
				<VariantTable
					setVariantID={setVariantID}
					variants={variants ?? []}
					deleteVariant={deleteVariant}
					duplicateVariant={duplicateVariant}
				/>
			</CardContent>
			<CardFooter className="justify-center">
				<Button
					size="md"
					variant="ghost"
					type="button"
					className="mt-2 text-mauve-11"
					onClick={generateVariants}
					disabled={!product?.options?.length}
				>
					<Icons.PlusCircle className="h-3.5 w-3.5 mr-2" />
					Generate variants
				</Button>
				<ProductVariant
					isOpen={isOpen}
					options={product?.options ?? []}
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
