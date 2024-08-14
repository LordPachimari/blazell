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
import React, { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { Currencies } from "./product-currencies";
import { isTouchDevice } from "~/utils/helpers";

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
	const [opened, setOpened] = React.useState(false);
	const [dropdownOpened, setDropdownOpened] = React.useState(false);
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
		<>
			<Card className={cn("min-h-[6rem] p-0", className)}>
				<CardHeader className="p-4 border-b border-border flex justify-between flex-row">
					<CardTitle className="items-center flex gap-1">
						Pricing
						{isPublished && (
							<TooltipProvider>
								<Tooltip delayDuration={250}>
									<TooltipTrigger asChild>
										<Icons.CircleInfo
											className="text-iris-9"
											aria-hidden="true"
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
					<div className="flex gap-2 items-start m-0">
						<DropdownMenu
							open={dropdownOpened}
							onOpenChange={setDropdownOpened}
						>
							<DropdownMenuTrigger
								onPointerDown={(e) => {
									if (isTouchDevice()) {
										e.preventDefault();
									}
								}}
								onClick={() => {
									if (isTouchDevice()) {
										setDropdownOpened((state) => !state);
									}
								}}
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
									<Icons.Plus size={14} /> Add
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 p-4">
					{prices.length === 0 && (
						<div className="w-full h-14 text-sm text-slate-11 flex justify-center items-center">
							Add price.
						</div>
					)}
					{prices.map((price) => (
						<div
							className="flex gap-2 w-full items-center"
							key={price.currencyCode}
						>
							<Label className="w-[3rem] font-bold">{price.currencyCode}</Label>
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
							<div className="aspect-square size-10">
								<button
									type="button"
									className="rounded-lg aspect-square bg-component w-full h-full border hover:bg-slate-2 border-border flex justify-center items-center"
									onClick={async () => await deletePrices(price.id)}
									onKeyDown={async (e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											e.stopPropagation();
											await deletePrices(price.id);
										}
									}}
								>
									<Icons.Close className="text-slate-11" size={20} />
								</button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Currencies
				createPrices={createPrices}
				prices={prices}
				id={variantID}
				opened={opened}
				setOpened={setOpened}
			/>
		</>
	);
}
export { Pricing };
