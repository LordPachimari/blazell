import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons } from "@blazell/ui/icons";
import { generateID } from "@blazell/utils";
import type { Product, Variant } from "@blazell/validators/client";
import React from "react";
import { useReplicache } from "~/zustand/replicache";
import VariantTable from "../variant-table/table";

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
	const [variantID, _setVariantID] = React.useState<string | null>(null);
	const [opened, setOpened] = React.useState(false);

	const setVariantID = (id: string | null) => {
		if (id === null) {
			setIsOpen(false);
		} else {
			setIsOpen(true);
		}
		_setVariantID(id);
	};

	const [isOpen, setIsOpen] = React.useState(false);

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
	const duplicateVariant = React.useCallback(
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
		<Card className="my-3 p-0">
			<CardHeader className="p-4 border-b border-border flex justify-between flex-row">
				<CardTitle className="items-center flex gap-1">
					Variants{" "}
					<span className="text-slate-9 font-thin text-sm">{"(Optional)"}</span>
				</CardTitle>
				<div className="flex gap-2 items-start m-0">
					<DropdownMenu>
						<DropdownMenuTrigger
							className={cn(
								buttonVariants({ size: "icon", variant: "ghost" }),
								"rounded-lg h-8 w-8 p-0 m-0 border-transparent hover:border-border hover:bg-slate-3",
							)}
						>
							<Icons.Dots className="h-4 w-4 text-slate-11" />
							<span className="sr-only">Open menu</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center" className="w-[160px]">
							<DropdownMenuItem
								className="flex gap-2"
								onClick={() => setOpened(true)}
							>
								<Icons.Edit size={14} /> Edit
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				<VariantTable
					setVariantID={setVariantID}
					variants={variants ?? []}
					deleteVariant={deleteVariant}
					duplicateVariant={duplicateVariant}
					generateVariants={generateVariants}
				/>
			</CardContent>
		</Card>
	);
}
