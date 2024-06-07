import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@blazell/ui/dialog";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type { UpdateVariant } from "@blazell/validators";
import type { ProductOption, Variant } from "@blazell/validators/client";
import debounce from "lodash.debounce";
import { useCallback, useMemo } from "react";
import { useReplicache } from "~/zustand/replicache";
import { Media } from "./product-media";
import { Pricing } from "./product-pricing";
import Stock from "./product-stock";
import { useDashboardStore } from "~/zustand/store";

interface ProductVariantProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	options: ProductOption[];
	variantID: string | null;
	productID: string;
	setVariantID: (id: string | null) => void;
	isPublished: boolean;
}

export default function ProductVariant({
	isOpen,
	setIsOpen,
	options,
	variantID,
	productID,
	setVariantID,
	isPublished,
}: Readonly<ProductVariantProps>) {
	const rep = useReplicache((state) => state.dashboardRep);
	const variantMap = useDashboardStore((state) => state.variantMap);
	const variant = variantMap.get(variantID ?? "");

	const updateVariant = useCallback(
		async (props: UpdateVariant) => {
			if (rep) {
				await rep.mutate.updateVariant({
					id: props.id,
					updates: props.updates,
				});
			}
		},
		[rep],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onVariantInputChange = useCallback(
		debounce(async (props: UpdateVariant) => {
			await updateVariant({ id: props.id, updates: props.updates });
		}, 800),
		[updateVariant],
	);
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
				<ScrollArea className="h-[calc(80vh)] px-2 md:px-4 py-2">
					<VariantOptions
						options={options}
						variant={variant}
						productID={productID}
					/>
					<Media images={variant?.images ?? []} variantID={variant?.id} />
					<Pricing
						prices={variant?.prices ?? []}
						variantID={variant?.id}
						isPublished={isPublished}
					/>
					<Stock
						variant={variant}
						updateVariant={updateVariant}
						onVariantInputChange={onVariantInputChange}
					/>
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
	variant: Variant | null | undefined;
	productID: string;
}) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const assignOptionValueToVariant = useCallback(
		async ({
			prevOptionValueID,
			optionValueID,
		}: { prevOptionValueID?: string; optionValueID: string }) => {
			variant &&
				(await dashboardRep?.mutate.assignOptionValueToVariant({
					variantID: variant.id,
					optionValueID,
					productID,
					...(prevOptionValueID && { prevOptionValueID }),
				}));
		},
		[dashboardRep, variant],
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
			(variant?.optionValues ?? []).reduce(
				(acc, value) => {
					acc[value.optionValue.optionID] = {
						id: value.optionValue.id,
						value: value.optionValue.value,
					};
					return acc;
				},
				{} as Record<string, { id: string; value: string }>,
			),
		[variant?.optionValues],
	);

	return (
		<div className="flex w-full flex-col gap-4 py-2">
			<h1
				className={cn("font-bold text-lg", {
					"text-ruby-7": !variant?.optionValues?.length,
				})}
			>
				Select options:
			</h1>
			{options.map((option) => {
				return (
					<div className="flex items-center  gap-2" key={option.id}>
						<span className="flex h-10 min-w-[4rem] items-center font-semibold bg-component border rounded-2xl border-mauve-7 justify-center">
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
								const newOptionValueID = optionValueToID[value];
								newOptionValueID &&
									(await assignOptionValueToVariant({
										...(prevOptionValueID && { prevOptionValueID }),
										optionValueID: newOptionValueID,
									}));
							}}
						>
							{option.optionValues?.map((v) => (
								<ToggleGroupItem value={v.value} key={v.value}>
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
