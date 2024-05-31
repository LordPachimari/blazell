import { generateID } from "@blazell/utils";
import type { CreatePrices, InsertPrice } from "@blazell/validators";
import { useMemo, useState } from "react";
import { Button } from "@blazell/ui/button";
import { ScrollArea } from "@blazell/ui/scroll-area";

import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type { Price } from "@blazell/validators/client";
import {
	DialogContent,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "@blazell/ui/dialog-vaul";

function Currencies({
	children,
	id,
	createPrices,
	prices,
}: {
	children: React.ReactNode;
	id: string | undefined;
	prices: (Price | InsertPrice)[];
	createPrices: (props: CreatePrices) => Promise<void>;
}) {
	const existingPrices = useMemo(
		() => new Set(prices.map((p) => p.currencyCode)),
		[prices],
	);
	const [opened, setDialogOpened] = useState(false);
	const [currencyCodes, setCurrencyCodes] = useState<string[]>([]);
	console.log("currencyCodes", currencyCodes);
	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setDialogOpened}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogTitle>Currencies</DialogTitle>

				<ScrollArea className="h-[calc(100vh-100px)] border-y-[1px] py-1 ">
					<ToggleGroup
						defaultValue={Array.from(existingPrices)}
						variant="outline"
						className="flex-wrap"
						type="multiple"
						onValueChange={(value) => {
							setCurrencyCodes(value.filter((v) => !existingPrices.has(v)));
							console.log("what", value);
						}}
					>
						{/* {Object.values(currencies).map((c) => ( */}
						<ToggleGroupItem value={"AUD"} key={"AUD"} className="rounded-md">
							{"AUD"}
						</ToggleGroupItem>
						{/* ))} */}
					</ToggleGroup>
				</ScrollArea>
				<div>
					<Button
						size="md"
						type="button"
						onClick={async () => {
							if (id && currencyCodes.length > 0) {
								await createPrices({
									id,
									prices: currencyCodes.map((code) => ({
										id: generateID({ prefix: "price" }),
										amount: 0,
										currencyCode: code,
										variantID: id,
									})),
								});
								setDialogOpened(false);
							}
						}}
					>
						Add
					</Button>
				</div>
			</DialogContent>
		</DialogRoot>
	);
}
export { Currencies };
