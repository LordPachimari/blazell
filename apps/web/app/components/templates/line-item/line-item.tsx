import { Card } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { Skeleton } from "@blazell/ui/skeleton";
import { toast } from "@blazell/ui/toast";
import { getLineItemPriceAmount } from "@blazell/utils";
import type { LineItem as LineItemType } from "@blazell/validators/client";
import { Effect } from "effect";
import Image from "~/components/molecules/image";
import Price from "~/components/molecules/price";

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
				<Card className="aspect-square flex items-center justify-center p-0 rounded-lg relative w-[100px]">
					<Image
						width={100}
						height={100}
						fit="cover"
						src={lineItem.variant.thumbnail?.url}
						className="rounded-lg"
						alt={lineItem.variant.thumbnail?.name ?? ""}
					/>
				</Card>
				<div className="flex gap-2 w-full justify-between">
					<div className="w-full flex flex-col justify-between">
						<h2 className="line-clamp-1 text-base text-start font-bold">
							{lineItem.title}
						</h2>
						<div>
							{lineItem.variant?.optionValues?.map((v) => (
								<span
									key={v.optionValue.id}
									className="flex gap-1 text-sm text-slate-11"
								>
									<p>{v.optionValue.option.name}:</p>
									<p>{v.optionValue.value}</p>
								</span>
							))}
						</div>
						<div className="flex items-center">
							{readonly ? (
								<p className="text-sm text-slate-11">{`quantity: ${lineItem.quantity}`}</p>
							) : (
								<>
									<button
										type="button"
										className="w-6 h-6 border flex items-center justify-center bg-slate-a-1 dark:bg-slate-5 border-border   rounded-lg hover:bg-slate-3 hover:text-slate-11"
										disabled={lineItem.quantity === 0}
										onClick={async () => {
											if (lineItem.quantity === 1)
												return await deleteItem?.(lineItem.id);
											await updateItem?.(lineItem.id, lineItem.quantity - 1);
										}}
									>
										<Icons.Minus size={10} />
									</button>
									<p className="text-sm text-slate-11 px-2">
										{lineItem.quantity}
									</p>
									<button
										type="button"
										className="w-6 h-6 border flex items-center justify-center bg-slate-a-1 dark:bg-slate-5 border-border   rounded-lg hover:bg-slate-3 hover:text-slate-11"
										onClick={async () =>
											await updateItem?.(lineItem.id, lineItem.quantity + 1)
										}
									>
										<Icons.Plus size={10} />
									</button>
								</>
							)}
						</div>
					</div>
					<div className="flex flex-col items-end justify-between">
						<Price
							amount={amount}
							currencyCode={currencyCode}
							className="font-bold"
						/>
						{!readonly && (
							<button
								type="button"
								className="w-8 text-red-9 h-8 border rounded-full flex items-center justify-center bg-slate-1 dark:bg-slate-5 border-border   hover:bg-slate-3 hover:text-red-10"
								onClick={async () => await deleteItem?.(lineItem.id)}
							>
								<Icons.Trash size={12} />
							</button>
						)}
					</div>
				</div>
			</li>
		</>
	);
};
export const LineItemSkeleton = () => {
	return (
		<li className="w-full flex gap-2">
			<Card className="aspect-square border-none flex items-center justify-center p-0 rounded-lg relative w-[100px]">
				<Skeleton className="w-[100px] h-[100px] rounded-lg" />
			</Card>
			<div className="flex gap-2 w-full justify-between">
				<div className="w-full flex flex-col gap-2 justify-between">
					<Skeleton className="w-[150px] h-[10px]" />
					<div className="flex flex-col gap-2">
						<Skeleton className="w-[150px] h-[10px]" />
						<Skeleton className="w-[150px] h-[10px]" />
					</div>
					<div className="flex items-center">
						<button
							type="button"
							className="w-6 h-6 border flex items-center justify-center bg-slate-a-1 dark:bg-slate-5 border-border   rounded-lg hover:bg-slate-3 hover:text-slate-11"
						>
							<Icons.Minus size={10} />
						</button>
						<Skeleton className="w-[15px] h-[15px] mx-2" />
						<button
							type="button"
							className="w-6 h-6 border flex items-center justify-center bg-slate-a-1 dark:bg-slate-5 border-border   rounded-lg hover:bg-slate-3 hover:text-slate-11"
						>
							<Icons.Plus size={10} />
						</button>
					</div>
				</div>
				<div className="flex flex-col items-end justify-between">
					<Skeleton className="w-[50px] h-[10px]" />
					<button
						type="button"
						className="w-8 text-red-9 h-8 border rounded-full flex items-center justify-center bg-slate-1 dark:bg-slate-5 border-border   hover:bg-slate-3 hover:text-red-10"
					>
						<Icons.Trash size={12} />
					</button>
				</div>
			</div>
		</li>
	);
};
