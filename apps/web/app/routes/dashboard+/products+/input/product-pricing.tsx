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
import { cn } from "@blazell/ui";

interface ProductPricingProps {
	prices: (Price | InsertPrice)[];
	variantID: string | undefined;
	isPublished: boolean;
	className?: string;
}
function Pricing({
	prices,
	variantID,
	isPublished,
	className,
}: ProductPricingProps) {
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
		<Card className={cn("min-h-[6rem] my-4 p-0", className)}>
			<CardTitle className="p-4 border-b border-mauve-5 dark:border-mauve-7 flex gap-2 items-center">
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
			<CardContent className="flex flex-col gap-2 p-4">
				{prices.length === 0 && (
					<div className="w-full h-full flex justify-center items-center">
						<Icons.BadgeDollarSign className="text-brand-9" />
					</div>
				)}
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
						<div className="aspect-square h-7 w-7">
							<button
								type="button"
								className="rounded-full aspect-square bg-mauve-2 h-7 w-7 border hover:bg-mauve-3 border-mauve-5 dark:border-mauve-7   flex justify-center items-center"
								onClick={async () => await deletePrices(price.id)}
							>
								<Icons.Close className="text-red-9" size={20} />
							</button>
						</div>
					</div>
				))}
			</CardContent>

			<CardFooter className="justify-center">
				<Currencies createPrices={createPrices} prices={prices} id={variantID}>
					<Button
						size="md"
						variant="ghost"
						type="button"
						className="text-mauve-11 rounded-none border-r-0 border-b-0 border-l-0 border-t rounded-b-lg"
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
