import React, { useCallback } from "react";

import type {
	DeleteProductOption,
	InsertProductOption,
	InsertProductOptionValue,
} from "@blazell/validators";

import { Input } from "@blazell/ui/input";

import { cn } from "@blazell/ui";
import { Badge } from "@blazell/ui/badge";
import { Button, buttonVariants } from "@blazell/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import {
	DialogContent,
	DialogRoot,
	DialogTitle,
} from "@blazell/ui/dialog-vaul";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons } from "@blazell/ui/icons";
import { Label } from "@blazell/ui/label";
import { TagInput } from "@blazell/ui/tag-input";
import { toast } from "@blazell/ui/toast";
import { generateID } from "@blazell/utils";
import type { ProductOption } from "@blazell/validators/client";
import { useReplicache } from "~/zustand/replicache";
import { isTouchDevice } from "~/utils/helpers";
import { ScrollArea } from "@blazell/ui/scroll-area";

interface CreateOptionProps {
	productID: string;
	options: ProductOption[];
}
export function ProductOptions({ productID, options }: CreateOptionProps) {
	const [opened, setOpened] = React.useState(false);
	const [editOpened, setEditOpened] = React.useState(false);
	const [optionName, setOptionName] = React.useState<string>();
	const [values, setValues] = React.useState<string[]>([]);
	const [selectedOption, setSelectedOption] = React.useState<ProductOption>();
	const [selectedOptionName, setSelectedOptionName] = React.useState<string>();
	const [selectedValues, setSelectedValues] = React.useState<string[]>([]);
	const [dropdownOpened, setDropdownOpened] = React.useState(false);
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const createOption = useCallback(
		async ({ name, values }: { name: string; values?: string[] }) => {
			const id = generateID({ prefix: "p_option" });
			const option: InsertProductOption = { id, productID, name };
			await dashboardRep?.mutate.createProductOption({
				option,
				...(values &&
					values.length > 0 && {
						optionValues: values.map((value) => ({
							id: generateID({ prefix: "p_op_val" }),
							optionID: id,
							value,
							option: options.find((o) => o.id === id),
						})),
					}),
			});
		},
		[dashboardRep, productID, options],
	);
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
	const updateOption = useCallback(
		async ({ optionID, name }: { optionID: string; name: string }) => {
			await dashboardRep?.mutate.updateProductOption({
				optionID,
				productID,
				updates: { name },
			});
		},
		[dashboardRep],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const updateValues = useCallback(
		async (optionID: string, values: string[]) => {
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
		},
		[dashboardRep, options],
	);
	const resetInputs = useCallback(() => {
		setOptionName("");
		setValues([]);
	}, []);
	const onSave = useCallback(
		async (optionName: string | undefined, values: string[]) => {
			if (optionName) {
				await createOption({
					name: optionName,
					...(values.length > 0 && { values }),
				});
				toast.success("Option created.");
			}
			setOpened(false);
			resetInputs();
		},
		[createOption, resetInputs],
	);
	const onEdit = useCallback(
		async (optionName: string | undefined, values: string[]) => {
			console.log(
				"check",
				selectedOption && optionName && optionName !== selectedOption.name,
			);
			console.log("selected", selectedOption, optionName, selectedOption?.name);
			if (selectedOption) {
				const valuesChanged =
					(selectedOption.optionValues ?? []).length !== values.length ||
					(selectedOption.optionValues ?? []).some((v) =>
						values.some((value) => value !== v.value),
					);

				optionName &&
					optionName !== selectedOption.name &&
					(await updateOption({
						optionID: selectedOption.id,
						name: optionName,
					}));

				valuesChanged && (await updateValues(selectedOption.id, values));

				toast.success("Option created.");
			}
			setEditOpened(false);
		},
		[selectedOption, updateOption, updateValues],
	);
	console.log("selected values", selectedValues);
	return (
		<>
			<Card className="p-0">
				<CardHeader className="p-4 border-b border-border flex justify-between flex-row items-center">
					<CardTitle className="items-center justify-center flex gap-1">
						Options{" "}
						<span className="text-slate-9 font-thin text-sm">
							{"(Optional)"}
						</span>
					</CardTitle>
					<div className="flex gap-2 items-start m-0">
						<DropdownMenu
							open={dropdownOpened}
							onOpenChange={setDropdownOpened}
						>
							<DropdownMenuTrigger
								onPointerDown={(e) => {
									if (isTouchDevice()) {
										e.preventDefault();
									}
								}}
								onClick={() => {
									if (isTouchDevice()) {
										setDropdownOpened((state) => !state);
									}
								}}
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
					<div className="flex border-border flex-col">
						{options.length === 0 && (
							<div className="w-full h-20 text-sm text-slate-11 flex justify-center items-center">
								Create options to add variants for this product.
							</div>
						)}
						{options.map((option) => {
							return (
								<div
									key={option.id}
									className="p-4 border-b last:border-b-0 border-border flex"
								>
									<p className="w-full text-sm flex items-center text-slate-11 ">{`${option.name?.[0]?.toUpperCase()}${option.name?.substring(
										1,
									)}`}</p>
									<div className="w-full flex items-center justify-between">
										<div className="flex w-full flex-wrap gap-1">
											{(option.optionValues ?? []).map((value) => (
												<Badge
													key={value.id}
													className="h-6 bg-brand-3 border-brand-7 border text-brand-9 font-thin text-xs"
												>
													{value.value}
												</Badge>
											))}
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger
												className={cn(
													buttonVariants({ size: "icon", variant: "ghost" }),
													"rounded-lg min-h-8 max-h-8 min-w-8 p-0 m-0 border-transparent hover:border-border hover:bg-slate-3",
												)}
											>
												<Icons.Dots className="h-4 w-4 text-slate-11" />
												<span className="sr-only">Open menu</span>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="center" className="w-[160px]">
												<DropdownMenuItem
													className="flex gap-2"
													onClick={() => {
														setEditOpened(true);
														setSelectedOption(option);
														setSelectedOptionName(option?.name ?? undefined);
														setSelectedValues(
															option?.optionValues?.map((v) => v.value) ?? [],
														);
													}}
												>
													<Icons.Edit size={14} /> Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													className="flex gap-2"
													onClick={async () =>
														await deleteOption({
															optionID: option.id,
															productID,
														})
													}
												>
													<Icons.Trash size={14} /> Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
			<DialogRoot direction="right" open={opened} onOpenChange={setOpened}>
				<DialogContent className="sm:w-[500px]">
					<DialogTitle className="p-4 border-b border-border font-bold text-xl">
						Create option
					</DialogTitle>
					<ScrollArea className="p-4 h-[78vh] pt-0">
						<div className="h-full flex flex-col pt-4 gap-4">
							<div className="flex flex-col gap-2">
								<Label className="pl-[1px]">Name</Label>
								<Input
									className="bg-slate-1"
									value={optionName}
									placeholder="Color"
									onChange={(e) => setOptionName(e.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="pl-[1px]">Values</Label>
								<TagInput
									className="bg-slate-1"
									value={values}
									onChange={(value) => setValues(value)}
								/>
							</div>
						</div>
					</ScrollArea>
					<div className="p-4 flex justify-end w-full border-t border-border absolute bottom-0">
						<div className="flex gap-2">
							<Button
								variant={"outline"}
								onClick={() => {
									resetInputs();
									setOpened(false);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										resetInputs();
										setOpened(false);
									}
								}}
							>
								Cancel
							</Button>
							<Button
								onClick={async () => await onSave(optionName, values)}
								onKeyDown={async (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										await onSave(optionName, values);
									}
								}}
							>
								Save
							</Button>
						</div>
					</div>
				</DialogContent>
			</DialogRoot>
			<DialogRoot
				direction="right"
				open={editOpened}
				onOpenChange={setEditOpened}
			>
				<DialogContent className="sm:w-[500px]">
					<DialogTitle className="p-4 border-b border-border font-bold text-xl">
						Edit option
					</DialogTitle>
					<section className="p-4 flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Name</Label>
							<Input
								className="bg-slate-1"
								value={selectedOptionName}
								placeholder="Color"
								onChange={(e) => setSelectedOptionName(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label className="pl-[1px]">Values</Label>
							<TagInput
								className="bg-slate-1"
								value={selectedValues}
								onChange={(value) => {
									console.log(value);
									setSelectedValues(value);
								}}
							/>
						</div>
					</section>
					<div className="p-4 flex bg-component justify-end w-full border-t border-border absolute bottom-0">
						<div className="flex gap-2">
							<Button
								variant={"outline"}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										setEditOpened(false);
									}
								}}
								onClick={() => setEditOpened(false)}
							>
								Cancel
							</Button>
							<Button
								onKeyDown={async (e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										e.stopPropagation();
										await onEdit(selectedOptionName, selectedValues);
									}
								}}
								onClick={async () => {
									await onEdit(selectedOptionName, selectedValues);
								}}
							>
								Save
							</Button>
						</div>
					</div>
				</DialogContent>
			</DialogRoot>
		</>
	);
}
