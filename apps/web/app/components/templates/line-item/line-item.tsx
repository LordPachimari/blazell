import { Button } from "@blazell/ui/button";
import { Card } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { Separator } from "@blazell/ui/separator";
import { toast } from "@blazell/ui/toast";
import { getLineItemPriceAmount, truncateString } from "@blazell/utils";
import type { LineItem as LineItemType } from "@blazell/validators/client";
import { Effect } from "effect";
import Image from "~/components/molecules/image";

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
	const amount =
		Effect.runSync(
			getLineItemPriceAmount(lineItem, currencyCode).pipe(
				Effect.catchTags({
					PriceNotFound: (e) =>
						Effect.try(() => {
							deleteItem?.(lineItem.id).then(() => toast.error(e.message));
						}),
				}),
			),
		) ?? 0;
	return (
		<>
			<li className="w-full flex gap-2">
				<Card className="aspect-square flex items-center justify-center rounded-lg relative">
					<Image
						width={50}
						height={50}
						src={lineItem.variant.thumbnail?.url}
						className="rounded-lg"
						alt={lineItem.variant.thumbnail?.name ?? ""}
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

							<h2 className="text-sm text-balance">{amount}</h2>
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
