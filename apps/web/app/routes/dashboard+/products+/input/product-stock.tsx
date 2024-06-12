import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useState } from "react";

import type { InsertVariant, UpdateVariant } from "@blazell/validators";

import { Card, CardContent, CardTitle } from "@blazell/ui/card";
import { Checkbox } from "@blazell/ui/checkbox";
import { Input } from "@blazell/ui/input";
import { Label } from "@blazell/ui/label";
import type { Variant } from "@blazell/validators/client";
import type { DebouncedFunc } from "~/types/debounce";

interface StockProps {
	variant: Variant | InsertVariant | undefined | null;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	onVariantInputChange: DebouncedFunc<
		(updates: UpdateVariant) => Promise<void>
	>;
}

const Stock = ({
	variant,
	updateVariant,
	onVariantInputChange,
}: StockProps) => {
	const [parent] = useAutoAnimate({ duration: 100 });
	const [hasCode, setHasCode] = useState(false);

	useEffect(() => {
		if (variant?.barcode ?? variant?.sku) {
			setHasCode(true);
		}
	}, [variant]);

	return (
		<Card className="my-4">
			<CardTitle>Stock</CardTitle>
			<CardContent>
				<Input
					type="number"
					className="my-2 w-20"
					min={1}
					defaultValue={variant?.quantity ?? 1}
					onChange={async (e) => {
						variant &&
							(await onVariantInputChange({
								updates: { quantity: e.currentTarget.valueAsNumber },
								id: variant.id,
							}));
					}}
				/>
				<span className="flex items-center gap-2">
					<Checkbox
						className="my-2"
						defaultChecked={variant?.allowBackorder ?? false}
						onCheckedChange={async (e) =>
							variant &&
							(await updateVariant({
								id: variant.id,
								updates: { allowBackorder: e as boolean },
							}))
						}
					/>
					<p className="text-sm">Continue selling when out of stock</p>
				</span>
				<span className="flex items-center gap-2">
					<Checkbox
						className="my-2"
						checked={hasCode}
						onCheckedChange={(e) => setHasCode(e as boolean)}
					/>
					<p className="text-sm">This product has SKU or Barcode</p>
				</span>
				<div className="my-2  flex  gap-4" ref={parent}>
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
			</CardContent>
		</Card>
	);
};

export default Stock;
