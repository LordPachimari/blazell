import { Button } from "@blazell/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { Input } from "@blazell/ui/input";
import { Label } from "@blazell/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@blazell/ui/tooltip";
import type {
	CreatePrices,
	InsertPrice,
	UpdatePrice,
} from "@blazell/validators";
import type { Price } from "@blazell/validators/client";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { Currencies } from "./product-currencies";

interface ProductPricingProps {
	prices: (Price | InsertPrice)[];
	variantID: string | undefined;
	isPublished: boolean;
}
function Pricing({ prices, variantID, isPublished }: ProductPricingProps) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const updatePrice = useCallback(
		debounce(async ({ priceID, updates, id }: UpdatePrice) => {
			await dashboardRep?.mutate.updatePrice({
				priceID,
				updates,
				id,
			});
		}, 200),
		[dashboardRep],
	);
	const createPrices = useCallback(
		async (props: CreatePrices) => {
			await dashboardRep?.mutate.createPrices(props);
		},
		[dashboardRep],
	);
	const deletePrices = useCallback(
		async (priceID: string) => {
			variantID &&
				(await dashboardRep?.mutate.deletePrices({
					id: variantID,
					priceIDs: [priceID],
				}));
		},
		[dashboardRep, variantID],
	);
	return (
		<Card className="min-h-[6rem] my-4">
			<CardTitle className="pb-4 flex gap-2 items-center">
				Pricing
				{isPublished && (
					<TooltipProvider>
						<Tooltip delayDuration={250}>
							<TooltipTrigger asChild>
								<Icons.CircleInfo
									className="text-iris-9"
									aria-hidden="true"
									strokeWidth={1.25}
									size={20}
								/>
							</TooltipTrigger>
							<TooltipContent>
								<p>You can't edit prices on a published product.</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</CardTitle>
			<CardContent className="flex flex-col gap-2 pb-4">
				{prices.map((price) => (
					<div
						className="flex gap-2 w-full items-center"
						key={price.currencyCode}
					>
						<Label className="w-[3rem]">{price.currencyCode}</Label>
						<Input
							type="number"
							disabled={isPublished}
							defaultValue={price.amount / 100}
							onChange={async (e) => {
								const cleanedValue = e.currentTarget.value.replace(/,/g, "");
								let valueInCents = Math.floor(
									Number.parseFloat(cleanedValue) * 100,
								);

								if (Number.isNaN(valueInCents)) {
									valueInCents = 0;
								}

								variantID &&
									(await updatePrice({
										priceID: price.id,
										updates: { amount: valueInCents },
										id: variantID,
									}));
							}}
						/>
						<Button
							size="icon"
							variant={"ghost"}
							className="rounded-full"
							onClick={async () => await deletePrices(price.id)}
						>
							<Icons.Close className="text-red-9" />
						</Button>
					</div>
				))}
			</CardContent>

			<CardFooter className="justify-center">
				<Currencies createPrices={createPrices} prices={prices} id={variantID}>
					<Button
						size="md"
						variant="ghost"
						type="button"
						className="mt-2 text-mauve-11"
					>
						<Icons.Plus className="h-3.5 w-3.5 mr-2" />
						Add Price
					</Button>
				</Currencies>
			</CardFooter>
		</Card>
	);
}
export { Pricing };
