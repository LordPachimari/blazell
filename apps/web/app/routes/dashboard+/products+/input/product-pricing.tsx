import { Button } from "@pachi/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@pachi/ui/card";
import { Input } from "@pachi/ui/input";
import { Label } from "@pachi/ui/label";
import type { CreatePrices, UpdatePrice } from "@pachi/validators";
import type { InsertPrice, Price } from "@pachi/validators/client";
import debounce from "lodash.debounce";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { Currencies } from "./product-currencies";
import { Icons } from "@pachi/ui/icons";

interface ProductPricingProps {
	prices: (Price | InsertPrice)[];
	id: string | undefined;
}
function Pricing({ prices, id }: ProductPricingProps) {
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
	const deleteVariantPrice = useCallback(
		async (priceID: string) => {
			id &&
				(await dashboardRep?.mutate.deletePrices({
					id: id,
					priceIDs: [priceID],
				}));
		},
		[dashboardRep, id],
	);
	return (
		<Card className="min-h-[6rem] my-4">
			<CardTitle className="pb-4">Pricing</CardTitle>
			<CardContent className="flex flex-col gap-2 pb-4">
				{prices.map((price) => (
					<div
						className="flex gap-2 w-full items-center"
						key={price.currencyCode}
					>
						<Label className="w-[3rem]">{price.currencyCode}</Label>
						<Input
							type="number"
							defaultValue={price.amount / 100}
							onChange={async (e) => {
								const cleanedValue = e.currentTarget.value.replace(/,/g, "");
								let valueInCents = Math.floor(
									Number.parseFloat(cleanedValue) * 100,
								);

								if (Number.isNaN(valueInCents)) {
									valueInCents = 0;
								}

								id &&
									(await updatePrice({
										priceID: price.id,
										updates: { amount: valueInCents },
										id,
									}));
							}}
						/>
						<Button
							size="icon"
							variant={"ghost"}
							onClick={async () => await deleteVariantPrice(price.id)}
						>
							<Icons.close className="text-red-500" />
						</Button>
					</div>
				))}
			</CardContent>

			<CardFooter className="justify-center">
				<Currencies createPrices={createPrices} prices={prices} id={id}>
					<Button
						size="md"
						variant="ghost"
						type="button"
						className="mt-2 text-mauve-11"
					>
						<Icons.plus className="h-3.5 w-3.5 mr-2" />
						Add Price
					</Button>
				</Currencies>
			</CardFooter>
		</Card>
	);
}
export { Pricing };
