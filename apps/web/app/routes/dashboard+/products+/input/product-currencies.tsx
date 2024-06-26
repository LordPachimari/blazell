import { Button } from "@blazell/ui/button";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { generateID } from "@blazell/utils";
import type { CreatePrices, InsertPrice } from "@blazell/validators";
import { useEffect, useState } from "react";

import {
	DialogContent,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from "@blazell/ui/dialog-vaul";
import { Icons } from "@blazell/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type { Price } from "@blazell/validators/client";

function Currencies({
	opened,
	setOpened,
	id,
	createPrices,
	prices,
}: {
	opened: boolean;
	setOpened: (value: boolean) => void;
	id: string | undefined;
	prices: (Price | InsertPrice)[];
	createPrices: (props: CreatePrices) => Promise<void>;
}) {
	const setDialogOpened = (value: boolean) => {
		if (!value) {
			setCurrencyCodes(Array.from(existingPrices));
		}
		setOpened(value);
	};
	const [existingPrices, setExistingPrices] = useState<string[]>([]);
	const [currencyCodes, setCurrencyCodes] = useState<string[]>([]);
	const [newCurrencyCodes, setNewCurrencyCodes] = useState<string[]>([]);

	useEffect(() => {
		const currencyCodes = prices.map((p) => p.currencyCode);
		setExistingPrices(currencyCodes);
		setCurrencyCodes(currencyCodes);
	}, [prices]);
	return (
		<DialogRoot direction="right" open={opened} onOpenChange={setDialogOpened}>
			<DialogTrigger asChild>
				<Button
					size="md"
					variant="ghost"
					type="button"
					className="text-mauve-11 rounded-none border-r-0 border-b-0 border-l-0 border-t rounded-b-lg"
					onClick={() => setOpened(true)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							setOpened(true);
						}
					}}
				>
					<Icons.Plus className="h-3.5 w-3.5 mr-2" />
					Add Price
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle className="p-4">Currencies</DialogTitle>

				<ScrollArea className="h-[calc(100vh-100px)] border-y-[1px] py-2 ">
					<ToggleGroup
						value={currencyCodes}
						variant="outline"
						className="flex-wrap"
						type="multiple"
						onValueChange={(value) => {
							setNewCurrencyCodes(
								value.filter((v) => !existingPrices.includes(v)),
							);
							const unique = new Set([...existingPrices, ...value]);
							setCurrencyCodes(Array.from(unique));
						}}
					>
						{/* {Object.values(currencies).map((c) => ( */}
						<ToggleGroupItem value={"AUD"} key={"AUD"} className="rounded-md">
							{"AUD"}
						</ToggleGroupItem>
						{/* ))} */}
					</ToggleGroup>
				</ScrollArea>
				<div className="p-4">
					<Button
						size="md"
						type="button"
						className="w-full"
						onClick={async () => {
							if (id && newCurrencyCodes.length > 0) {
								await createPrices({
									id,
									prices: newCurrencyCodes.map((code) => ({
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
