import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useState } from "react";

import type { InsertVariant, UpdateVariant } from "@blazell/validators";

import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import { Input } from "@blazell/ui/input";
import { Label } from "@blazell/ui/label";
import type { Variant } from "@blazell/validators/client";
import type { DebouncedFunc } from "~/types/debounce";
import { cn } from "@blazell/ui";
import { Checkbox } from "@headlessui/react";
import { Icons } from "@blazell/ui/icons";

interface StockProps {
	variant: Variant | InsertVariant | undefined | null;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	onVariantInputChange: DebouncedFunc<
		(updates: UpdateVariant) => Promise<void>
	>;
	className?: string;
}

const Stock = ({
	variant,
	updateVariant,
	onVariantInputChange,
	className,
}: StockProps) => {
	const [parent] = useAutoAnimate({ duration: 100 });
	const [hasCode, setHasCode] = useState(false);

	useEffect(() => {
		if (variant?.barcode ?? variant?.sku) {
			setHasCode(true);
		}
	}, [variant]);

	return (
		<Card className={cn("my-2 p-0", className)}>
			<CardHeader className="p-4 border-b border-border">
				<CardTitle>Stock</CardTitle>
			</CardHeader>
			<CardContent className="p-4">
				<Input
					type="number"
					className="my-2 w-20"
					min={0}
					defaultValue={variant?.quantity ?? 1}
					onChange={async (e) => {
						variant &&
							(await onVariantInputChange({
								updates: { quantity: e.currentTarget.valueAsNumber },
								id: variant.id,
							}));
					}}
				/>
				<div className="flex flex-col gap-2 pt-2">
					<span className="flex items-center gap-2">
						{/* <Checkbox
						className="my-2"
						defaultChecked={variant?.allowBackorder ?? false}
						onCheckedChange={async (e) =>
							variant &&
							(await updateVariant({
								id: variant.id,
								updates: { allowBackorder: e as boolean },
							}))
						}
					/> */}
						<Checkbox
							defaultChecked={variant?.allowBackorder ?? false}
							onChange={async (value) =>
								variant &&
								(await updateVariant({
									id: variant.id,
									updates: { allowBackorder: value },
								}))
							}
							className="group size-6 rounded-md border border-mauve-7 bg-white/10 p-1 ring-1 ring-white/15 ring-inset data-[checked]:bg-brand-4 data-[checked]:text-brand-9 data-[checked]:border-brand-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
						>
							<Icons.Check className="hidden size-4 text-brand-9 group-data-[checked]:block" />
						</Checkbox>
						<p className="text-sm">Continue selling when out of stock</p>
					</span>
					<span className="flex items-center gap-2">
						<Checkbox
							checked={hasCode}
							onChange={(value) => setHasCode(value)}
							className="group size-6 rounded-md border border-mauve-7 bg-white/10 p-1 ring-1 ring-white/15 ring-inset data-[checked]:bg-brand-4 data-[checked]:text-brand-9 data-[checked]:border-brand-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
						>
							<Icons.Check className="hidden size-4 text-brand-9 group-data-[checked]:block" />
						</Checkbox>
						<p className="text-sm">This product has SKU or Barcode</p>
					</span>
					<div ref={parent}>
						{hasCode && (
							<div className="flex justify-between gap-3 w-full">
								<span className="w-full">
									<Label>SKU</Label>
									<Input
										defaultValue={variant?.sku ?? ""}
										onChange={async (e) =>
											variant &&
											(await onVariantInputChange({
												updates: {
													sku: e.currentTarget.value,
												},
												id: variant.id,
											}))
										}
									/>
								</span>
								<span className="w-full">
									<Label>Barcode</Label>
									<Input
										defaultValue={variant?.barcode ?? ""}
										onChange={async (e) =>
											variant &&
											(await onVariantInputChange({
												updates: {
													barcode: e.currentTarget.value,
												},
												id: variant.id,
											}))
										}
									/>
								</span>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default Stock;
