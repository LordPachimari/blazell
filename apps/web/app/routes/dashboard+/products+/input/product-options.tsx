import { useAutoAnimate } from "@formkit/auto-animate/react";
import debounce from "lodash.debounce";
import React, { useCallback } from "react";

import type {
	DeleteProductOption,
	InsertProductOption,
	InsertProductOptionValue,
} from "@blazell/validators";

import { useEffect, useState } from "react";

import { Input } from "@blazell/ui/input";

import { Button, buttonVariants } from "@blazell/ui/button";
import { generateID } from "@blazell/utils";
import type { ProductOption } from "@blazell/validators/client";
import type { DebouncedFunc } from "~/types/debounce";
import { useReplicache } from "~/zustand/replicache";
import { Icons } from "@blazell/ui/icons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { cn } from "@blazell/ui";
import {
	DialogRoot,
	DialogContent,
	DialogTitle,
} from "@blazell/ui/dialog-vaul";
import { Label } from "@blazell/ui/label";
import { TagInput } from "@blazell/ui/tag-input";
import { Badge } from "@blazell/ui/badge";

interface CreateOptionProps {
	productID: string;
	options: ProductOption[];
}
export function ProductOptions({ productID, options }: CreateOptionProps) {
	const [opened, setOpened] = React.useState(false);
	const [values, setValues] = React.useState<string[]>([]);
	return (
		<>
			<Card className="my-3 p-0">
				<CardHeader className="p-4 border-b border-border flex justify-between flex-row items-center">
					<CardTitle className="items-center justify-center flex gap-1">
						Options{" "}
						<span className="text-slate-9 font-thin text-sm">
							{"(Optional)"}
						</span>
					</CardTitle>
					<div className="flex gap-2 items-start m-0">
						<DropdownMenu>
							<DropdownMenuTrigger
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
									<Icons.Plus size={14} /> Create
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="rounded-lg w-full">
					<div className="flex py-4 border-border p-4">
						{options.length === 0 && (
							<div className="w-full h-20 text-sm text-slate-11 flex justify-center items-center">
								Create options to add variants for this product.
							</div>
						)}
						{options.map((option) => (
							<div key={option.id}>
								<p className="w-full text-sm text-slate-11">{option.name}</p>
								<div className="w-full">
									{(option.optionValues ?? []).map((value) => (
										<Badge
											key={value.id}
											className="h-6 bg-brand-3 border-brand-7 border text-brand-9 font-thin text-xs pr-0"
										>
											{value.value}
										</Badge>
									))}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
				<DialogContent className="sm:w-[500px]">
					<DialogTitle className="p-4 border-b border-border font-bold text-xl">
						Create option
					</DialogTitle>
					<section className="p-4 flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Name</Label>
							<Input className="bg-slate-1" placeholder="Color, size..." />
						</div>

						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Values</Label>
							<TagInput
								className="bg-slate-1"
								value={values}
								onChange={(value) => setValues(value)}
							/>
						</div>
					</section>
					<div className="p-4 flex justify-end w-full border-t border-border absolute bottom-0">
						<div className="flex gap-2">
							<Button variant={"outline"}>Cancel</Button>
							<Button>Save</Button>
						</div>
					</div>
				</DialogContent>
			</DialogRoot>
		</>
	);
}

export function _ProductOptions({ productID, options }: CreateOptionProps) {
	const { dashboardRep } = useReplicache();
	const createOption = useCallback(async () => {
		const id = generateID({ prefix: "p_option" });
		const option: InsertProductOption = { id, productID };
		await dashboardRep?.mutate.createProductOption({ option });
	}, [dashboardRep, productID]);
	const deleteOption = useCallback(
		async ({ optionID, productID }: DeleteProductOption) => {
			await dashboardRep?.mutate.deleteProductOption({
				optionID,
				productID,
			});
		},
		[dashboardRep],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onOptionNameChange = useCallback(
		debounce(async (optionID: string, name: string) => {
			await dashboardRep?.mutate.updateProductOption({
				optionID,
				productID,
				updates: { name },
			});
		}, 300),
		[dashboardRep],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onOptionValuesChange = useCallback(
		debounce(async (optionID: string, values: string[]) => {
			const newOptionValues: InsertProductOptionValue[] = options
				? values.map((value) => ({
						id: generateID({ prefix: "p_op_val" }),
						optionID,
						value,
						option: options.find((o) => o.id === optionID),
					}))
				: [];
			await dashboardRep?.mutate.updateProductOptionValues({
				optionID,
				productID,
				newOptionValues,
			});
		}, 300),
		[dashboardRep, options],
	);

	const [parent] = useAutoAnimate({ duration: 100 });

	return (
		<section className="w-full">
			<Button
				size="md"
				className="text-slate-11"
				variant={"ghost"}
				type="button"
				onClick={createOption}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						createOption();
					}
				}}
			>
				<Icons.PlusCircle className="h-3.5 w-3.5 mr-2" />
				Add option
			</Button>
			{options && options.length > 0 && (
				<div className="my-2 flex w-[calc(100%-40px)] gap-2">
					<label className="w-full text-sm font-bold">{"Option name"}</label>
					<label className="w-full text-sm font-bold">
						{"Option values (comma separated)"}
					</label>
				</div>
			)}
			<ul ref={parent} className="flex list-none flex-col gap-2 ">
				{options?.map((option) => (
					<li key={option.id} className="flex gap-2 items-center">
						<Option
							onOptionNameChange={onOptionNameChange}
							onOptionValuesChange={onOptionValuesChange}
							option={option}
						/>
						<button
							type="button"
							className="rounded-full bg-slate-2 h-7 w-7 border hover:bg-slate-3 border-border   flex justify-center items-center"
							onClick={async () =>
								await deleteOption({
									optionID: option.id,
									productID: productID,
								})
							}
						>
							<Icons.Close className="text-red-9" size={20} />
						</button>
					</li>
				))}
			</ul>
		</section>
	);
}

interface OptionProps {
	option: ProductOption;
	onOptionNameChange: DebouncedFunc<
		(id: string, name: string) => Promise<void>
	>;
	onOptionValuesChange: DebouncedFunc<
		(optionID: string, values: string[]) => Promise<void>
	>;
}

export function Option({
	option,
	onOptionNameChange,
	onOptionValuesChange,
}: OptionProps) {
	const [values, setValues] = useState<string[]>([]);

	useEffect(() => {
		const values = option.optionValues?.map((v) => v.value) ?? [];
		setValues(values);
	}, [option.optionValues]);

	return (
		<div className="flex gap-2 w-full">
			<Input
				className="w-full md:w-[120px] text-sm"
				defaultValue={option.name ?? ""}
				placeholder="Size, color"
				onChange={async (e) => {
					await onOptionNameChange(option.id, e.target.value);
				}}
			/>
			<TagInput
				value={values}
				onChange={async (values) => {
					setValues(values as string[]);
					await onOptionValuesChange(option.id, values as string[]);
				}}
				className="w-full"
				placeholder="green, large (comma separated)"
			/>
		</div>
	);
}
