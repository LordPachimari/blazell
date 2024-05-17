import { useCallback, useEffect, useMemo } from "react";

import { cn } from "@pachi/ui";
import { Button } from "@pachi/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@pachi/ui/dialog";
import { Icons, strokeWidth } from "@pachi/ui/icons";
import { ScrollArea } from "@pachi/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@pachi/ui/toggle-group";
import type { ProductOption, Variant } from "@pachi/validators/client";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { Media } from "./product-media";
import { Pricing } from "./product-pricing";
import Stock from "./product-stock";

interface ProductVariantProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	options: ProductOption[];
	variantID: string | null;
	productID: string | undefined;
	setVariantID: (id: string | null) => void;
}

export default function ProductVariant({
	isOpen,
	setIsOpen,
	options,
	variantID,
	productID,
	setVariantID,
}: Readonly<ProductVariantProps>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const variant = ReplicacheStore.getByPK<Variant>(
		dashboardRep,
		`variant_${productID}_${variantID}`,
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!variantID || !productID) setIsOpen(false);
	}, [productID, variantID]);
	if (!variant || !productID) return null;
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="md:w-[800px] bg-mauve-2 p-4 pt-4 gap-0">
				<span className="flex w-full justify-between p-2 px-4">
					<DialogTitle className="text-2xl">Variant</DialogTitle>
					<Button
						type="button"
						variant={"ghost"}
						size="icon"
						onClick={() => setVariantID(null)}
					>
						<Icons.close size={20} strokeWidth={strokeWidth} />
					</Button>
				</span>
				<ScrollArea className="h-[calc(80vh)] px-4 py-2">
					<VariantOptions
						options={options}
						variant={variant}
						productID={productID}
					/>
					<Media images={variant.images ?? []} id={variant.id} />
					<Pricing prices={variant.prices ?? []} id={variant.id} />
					<Stock entity={variant} />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
function VariantOptions({
	options,
	variant,
	productID,
}: {
	options: ProductOption[];
	variant: Variant;
	productID: string;
}) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const assignOptionValueToVariant = useCallback(
		async ({
			prevOptionValueID,
			optionValueID,
		}: { prevOptionValueID?: string; optionValueID: string }) => {
			await dashboardRep?.mutate.assignOptionValueToVariant({
				variantID: variant.id,
				optionValueID,
				productID,
				...(prevOptionValueID && { prevOptionValueID }),
			});
		},
		[dashboardRep],
	);
	const optionValueToID = useMemo(
		() =>
			options.reduce(
				(acc, option) => {
					for (const value of option.optionValues ?? []) {
						acc[value.value] = value.id;
					}
					return acc;
				},
				{} as Record<string, string>,
			),
		[options],
	);
	const optionIDToVariantOptionValue = useMemo(
		() =>
			(variant.optionValues ?? []).reduce(
				(acc, value) => {
					acc[value.optionValue.optionID] = {
						id: value.optionValue.id,
						value: value.optionValue.value,
					};
					return acc;
				},
				{} as Record<string, { id: string; value: string }>,
			),
		[variant.optionValues],
	);

	return (
		<div className="flex w-full flex-col gap-4 py-2">
			<h1
				className={cn("font-bold text-lg", {
					"text-red-500": !variant.optionValues?.length,
				})}
			>
				Select options:
			</h1>
			{options.map((option) => {
				return (
					<div className="flex items-center  gap-2" key={option.id}>
						<span className="flex h-10 min-w-[4rem] items-center font-semibold dark:bg-black justify-center">
							{option.name}
						</span>
						:
						<ToggleGroup
							type="single"
							value={optionIDToVariantOptionValue[option.id]?.value ?? ""}
							variant="outline"
							onValueChange={async (value) => {
								const prevOptionValueID =
									optionIDToVariantOptionValue[option.id]?.id;
								await assignOptionValueToVariant({
									...(prevOptionValueID && { prevOptionValueID }),
									optionValueID: optionValueToID[value]!,
								});
							}}
						>
							{option.optionValues?.map((v) => (
								<ToggleGroupItem
									value={v.value}
									key={v.value}
									className="bg-white"
								>
									{v.value}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
				);
			})}
		</div>
	);
}
