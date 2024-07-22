import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import { generateID } from "@blazell/utils";
import type { Product, Variant } from "@blazell/validators/client";
import React, { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import VariantTable from "../variant-table/table";
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
}: ProductVariantsProps) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const [variantID, _setVariantID] = React.useState<string | null>(null);

	const [isOpen, setIsOpen] = React.useState(false);
	const setVariantID = useCallback((id: string | null) => {
		if (id === null) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
		_setVariantID(id);
	}, []);
	console.log("isOpen", isOpen);

	const generateVariants = React.useCallback(async () => {
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

	const deleteVariant = React.useCallback(
		async (keys: string[]) => {
			if (dashboardRep) {
				await dashboardRep.mutate.deleteVariant({
					keys,
				});
			}
		},
		[dashboardRep],
	);

	return (
		<>
			<ProductVariant
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				product={product}
				setVariantID={setVariantID}
				variantID={variantID}
			/>

			<Card className="p-0">
				<CardHeader className="p-4 py-6 border-b border-border flex justify-between flex-row">
					<CardTitle className="items-center flex gap-1">
						Variants{" "}
						<span className="text-slate-9 font-thin text-sm">
							{"(Optional)"}
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<VariantTable
						setVariantID={setVariantID}
						variants={variants ?? []}
						deleteVariant={deleteVariant}
						generateVariants={generateVariants}
					/>
				</CardContent>
			</Card>
		</>
	);
}
