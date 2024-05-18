import { Button } from "@pachi/ui/button";
import { Card } from "@pachi/ui/card";
import { Icons } from "@pachi/ui/icons";
import { Separator } from "@pachi/ui/separator";
import { generateLineItemPrice, truncateString } from "@pachi/utils";
import type { LineItem as LineItemType } from "@pachi/validators/client";
import { Image } from "~/components/image";

export const LineItem = ({
	lineItem,
	deleteItem,
	updateItem,
	currencyCode,
	readonly = false,
}: {
	lineItem: LineItemType;
	deleteItem?: (id: string) => Promise<void>;
	updateItem?: (id: string, quantity: number) => Promise<void>;
	currencyCode: string;
	readonly?: boolean;
}) => {
	return (
		<>
			<li className="w-full flex gap-2">
				<Card className="aspect-square flex items-center justify-center rounded-lg relative">
					<Image
						src={lineItem.thumbnail?.url ?? ""}
						fit={"fill"}
						className="rounded-lg"
						alt={lineItem.thumbnail?.name ?? ""}
					/>
				</Card>
				<div className="flex gap-2 w-full justify-between">
					<div className="w-full flex flex-col justify-between">
						<h2 className="text-sm text-balance font-bold">
							{truncateString(lineItem.title, 20)}
						</h2>
						<div>
							{lineItem.variant?.optionValues?.map((v) => (
								<span
									key={v.optionValue.id}
									className="flex gap-1 text-sm text-mauve-11"
								>
									<p>{v.optionValue.option.name}:</p>
									<p>{v.optionValue.value}</p>
								</span>
							))}
						</div>
						<div className="flex items-center">
							{readonly ? (
								<p className="text-sm text-mauve-11">{`quantity: ${lineItem.quantity}`}</p>
							) : (
								<>
									<Button
										variant={"ghost"}
										size="icon"
										disabled={lineItem.quantity === 0}
										onClick={async () => {
											if (lineItem.quantity === 1)
												return await deleteItem?.(lineItem.id);
											await updateItem?.(lineItem.id, lineItem.quantity - 1);
										}}
									>
										<Icons.minus size={10} />
									</Button>
									<p className="text-sm text-mauve-11">{lineItem.quantity}</p>
									<Button
										variant={"ghost"}
										size={"icon"}
										onClick={async () =>
											await updateItem?.(lineItem.id, lineItem.quantity + 1)
										}
									>
										<Icons.plus size={10} />
									</Button>
								</>
							)}
						</div>
					</div>
					<div className="flex flex-col items-end justify-between">
						<span className="flex gap-1 font-bold">
							<h2 className="text-sm text-balance">{currencyCode}</h2>

							<h2 className="text-sm text-balance">
								{generateLineItemPrice(lineItem, currencyCode) *
									lineItem.quantity}
							</h2>
						</span>
						{!readonly && (
							<Button
								variant={"ghost"}
								className="text-red-500 hover:text-red-600"
								onClick={async () => await deleteItem?.(lineItem.id)}
							>
								<Icons.trash size={16} />
							</Button>
						)}
					</div>
				</div>
			</li>
			<Separator className="my-2" />
		</>
	);
};
