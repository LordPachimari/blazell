import { Button } from "@blazell/ui/button";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { generateID } from "@blazell/utils";
import type { CreatePrices, InsertPrice } from "@blazell/validators";
import { useEffect, useState } from "react";

import {
	DialogContent,
	DialogRoot,
	DialogTitle,
} from "@blazell/ui/dialog-vaul";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type { Price } from "@blazell/validators/client";
import { Input } from "@blazell/ui/input";

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
			<DialogContent className="w-[350px]">
				<DialogTitle className="p-4">Currencies</DialogTitle>

				<ScrollArea className="h-[calc(100vh-100px)] border-y-[1px] p-2 pt-0">
					<Input type="search" className="mt-4" />
					<ToggleGroup
						value={currencyCodes}
						variant="outline"
						className="flex-wrap pt-4"
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
						<ToggleGroupItem
							value={"AUD"}
							key={"AUD"}
							className="rounded-md w-full pl-0"
						>
							<div className="w-16 border-r h-10 flex justify-center items-center">
								{"AUD"}
							</div>
							<div className="w-full">Australian Dollar</div>
						</ToggleGroupItem>
						{/* ))} */}
					</ToggleGroup>
				</ScrollArea>
				<div className="p-4 bg-component">
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
