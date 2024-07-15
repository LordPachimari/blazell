import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import {
	DialogRoot,
	DialogContent,
	DialogTitle,
} from "@blazell/ui/dialog-vaul";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons } from "@blazell/ui/icons";
import { Input } from "@blazell/ui/input";
import { Textarea } from "@blazell/ui/textarea";
import { Label } from "@blazell/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import { productStatuses, type UpdateVariant } from "@blazell/validators";
import type { Product, Variant } from "@blazell/validators/client";
import React, { useCallback } from "react";
import { ProductStatus } from "~/components/molecules/statuses/product-status";
import type { DebouncedFunc } from "~/types/debounce";
import { Toggle } from "@blazell/ui/toggle";
import { Switch } from "@blazell/ui/switch";
export function ProductInfo({
	defaultVariant,
	onVariantInputChange,
	product,
	updateVariant,
}: {
	defaultVariant: Variant | undefined;
	onVariantInputChange: DebouncedFunc<
		(updates: UpdateVariant) => Promise<void>
	>;
	product: Product | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
}) {
	const [opened, setOpened] = React.useState(false);
	const onDescriptionChange = useCallback(
		async (value: string) => {
			defaultVariant?.id &&
				(await updateVariant({
					id: defaultVariant.id,
					updates: { description: value },
				}));
		},
		[updateVariant, defaultVariant],
	);
	return (
		<>
			<Card className="p-0">
				<CardHeader className="px-4 py-2 border-b flex justify-between rounded-t-lg items-center flex-row border-border">
					<CardTitle>{defaultVariant?.title ?? "Untitled"}</CardTitle>
					<div className="flex gap-2 mt-0 no-space-y">
						<ProductStatus status={product?.status ?? "draft"} />
						<DropdownMenu>
							<DropdownMenuTrigger
								className={cn(
									buttonVariants({ size: "icon", variant: "ghost" }),
									"rounded-lg h-8 w-8 p-0 border-transparent hover:border-border hover:bg-slate-3",
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
									<Icons.Edit size={14} /> Edit
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="rounded-lg w-full">
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Description</p>
						<p className="w-full text-sm text-slate-11">Description</p>
					</div>
					<div className="flex py-4 border-b border-border p-4">
						<p className="w-full text-sm text-slate-11">Handle</p>
						<p className="w-full text-sm text-slate-11">Handle</p>
					</div>
					<div className="flex py-4 p-4">
						<p className="w-full text-sm text-slate-11">Discountable</p>
						<p className="w-full text-sm text-slate-11">Discountable</p>
					</div>
				</CardContent>
			</Card>
			<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
				<DialogContent className="sm:w-[500px]">
					<DialogTitle className="p-4 border-b border-border font-bold text-xl">
						Edit product
					</DialogTitle>
					<section className="p-4 flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Status</Label>
							<ToggleGroup
								type="single"
								value={product?.status ?? "draft"}
								onValueChange={() => console.log("change")}
							>
								{productStatuses.map((status) => (
									<ToggleGroupItem
										key={status}
										value={status}
										className="text-sm h-9"
									>
										{status}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Title</Label>
							<Input className="bg-slate-1" />
						</div>
						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Handle</Label>
							<Input
								className="bg-slate-1 "
								icon={
									<div className="flex justify-center items-center text-slate-9">
										/
									</div>
								}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">
								Material{" "}
								<span className="text-slate-9 font-thin text-sm">
									{"(Optional)"}
								</span>
							</Label>
							<Input className="bg-slate-1" />
						</div>

						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">
								Description{" "}
								<span className="text-slate-9 font-thin text-sm">
									{"(Optional)"}
								</span>
							</Label>
							<Textarea className="bg-slate-1" />
						</div>
						<div className="flex gap-2 items-center bg-slate-2 border p-3 rounded-lg border-border border-b-slate-7">
							<Switch />
							<div>
								<h2 className="font-bold text-sm">Discountable</h2>
								<p className="text-sm text-slate-11">
									When unchecked, discounts will not be applied to this product.
								</p>
							</div>
						</div>
					</section>
				</DialogContent>
			</DialogRoot>
		</>
	);
}
