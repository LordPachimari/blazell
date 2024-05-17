import { useAutoAnimate } from "@formkit/auto-animate/react";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useState } from "react";

import type { UpdateProduct, UpdateVariant } from "@pachi/validators";

import { Card, CardContent, CardTitle } from "@pachi/ui/card";
import { Checkbox } from "@pachi/ui/checkbox";
import { Input } from "@pachi/ui/input";
import { Label } from "@pachi/ui/label";
import type { InsertVariant, Product, Variant } from "@pachi/validators/client";
import { useReplicache } from "~/zustand/replicache";

interface StockProps {
	entity: Variant | InsertVariant | Product | undefined | null;
}

const Stock = ({ entity }: StockProps) => {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const updateEntity = useCallback(
		async (props: UpdateProduct["updates"] | UpdateVariant["updates"]) => {
			if (dashboardRep && entity) {
				if (entity.id.startsWith("product")) {
					return await dashboardRep.mutate.updateProduct({
						updates: props,
						id: entity.id,
					});
				}
				return await dashboardRep.mutate.updateVariant({
					updates: props,
					id: entity.id,
				});
			}
		},
		[dashboardRep, entity],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onInputChange = useCallback(
		debounce(
			async (updates: UpdateProduct["updates"] | UpdateVariant["updates"]) => {
				await updateEntity(updates);
			},
			500,
		),
		[entity],
	);
	const [parent] = useAutoAnimate({ duration: 100 });
	const [hasCode, setHasCode] = useState(false);

	useEffect(() => {
		if (entity?.barcode ?? entity?.sku) {
			setHasCode(true);
		}
	}, [entity]);

	return (
		<Card className="my-4">
			<CardTitle>Stock</CardTitle>
			<CardContent>
				<Input
					type="number"
					className="my-2 w-20"
					defaultValue={entity?.quantity ?? 1}
					min={1}
					onChange={async (e) => {
						await onInputChange({ quantity: e.currentTarget.valueAsNumber });
					}}
				/>
				<span className="flex items-center gap-2">
					<Checkbox
						className="my-2"
						defaultChecked={entity?.allowBackorder ?? false}
						onCheckedChange={async (e) =>
							await updateEntity({
								allowBackorder: e as boolean,
							})
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
									defaultValue={entity?.sku ?? ""}
									onChange={async (e) =>
										await onInputChange({
											sku: e.currentTarget.value,
										})
									}
								/>
							</span>
							<span className="w-full">
								<Label>Barcode</Label>
								<Input
									defaultValue={entity?.barcode ?? ""}
									onChange={async (e) =>
										await onInputChange({
											barcode: e.currentTarget.value,
										})
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
