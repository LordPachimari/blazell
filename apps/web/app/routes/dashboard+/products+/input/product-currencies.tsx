import { generateID } from "@pachi/utils";
import { currencies, type CreatePrices } from "@pachi/validators";
import { useMemo, useState } from "react";
import { Button } from "@pachi/ui/button";
import { ScrollArea } from "@pachi/ui/scroll-area";
import {
	SheetContent,
	SheetRoot,
	SheetTitle,
	SheetTrigger,
} from "@pachi/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@pachi/ui/toggle-group";
import type { InsertPrice, Price } from "@pachi/validators/client";

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
	return (
		<SheetRoot open={opened} onOpenChange={setDialogOpened}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent>
				<SheetTitle>Currencies</SheetTitle>

				<ScrollArea className="h-[calc(100vh-100px)] border-y-[1px] py-1 ">
					<ToggleGroup
						defaultValue={Array.from(existingPrices)}
						variant="outline"
						className="flex-wrap"
						type="multiple"
						onValueChange={(value) =>
							setCurrencyCodes(value.filter((v) => !existingPrices.has(v)))
						}
					>
						{Object.values(currencies).map((c) => (
							<ToggleGroupItem
								value={c.code}
								key={c.code}
								className="rounded-md"
							>
								{c.code}
							</ToggleGroupItem>
						))}
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
										...(id.startsWith("product")
											? { productID: id }
											: { variantID: id }),
									})),
								});
								setDialogOpened(false);
							}
						}}
					>
						Add
					</Button>
				</div>
			</SheetContent>
		</SheetRoot>
	);
}
export { Currencies };
