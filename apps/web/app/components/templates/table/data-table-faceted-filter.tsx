import { CheckIcon } from "@radix-ui/react-icons";
import type { Column, Table } from "@tanstack/react-table";
import type * as React from "react";

import { cn } from "@blazell/ui";
import { Badge } from "@blazell/ui/badge";
import { Button } from "@blazell/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@blazell/ui/command";
import { Icons } from "@blazell/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@blazell/ui/popover";

interface DataTableFacetedFilterProps<TData, TValue> {
	column: Column<TData, TValue> | undefined;
	title?: string;
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	table: Table<TData>;
}

export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	table,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set(column?.getFilterValue() as string[]);
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className={cn("flex flex-row h-9 pl-2 pr-0 ")}
					variant={"outline"}
					size={"md"}
				>
					<div className="flex items-center">
						<p className="font-body font-normal text-sm h-9 flex items-center text-slate-11 pr-2">
							{title}
						</p>
						{selectedValues?.size > 0 && (
							<div className="border-l h-9 flex flex-col justify-center px-1">
								<Badge
									variant="secondary"
									className="bg-brand-3 h-6 text-nowrap rounded-md px-1 lg:hidden font-normal border-brand-9"
								>
									<p className="text-brand-9">{selectedValues.size}</p>
								</Badge>
								<div className="hidden space-x-1 lg:flex">
									{selectedValues.size > 2 ? (
										<Badge
											variant="secondary"
											className="h-6 text-nowrap bg-brand-3 rounded-md px-1 border-brand-9"
										>
											<p className="text-brand-9">
												{selectedValues.size} selected
											</p>
										</Badge>
									) : (
										options
											.filter((option) => selectedValues.has(option.value))
											.map((option) => (
												<Badge
													variant="secondary"
													key={option.value}
													className="bg-brand-3 h-6 text-nowrap hover:bg-brand-3 rounded-md px-1 font-normal border-brand-9"
												>
													<p className="text-brand-9">{option.label}</p>
												</Badge>
											))
									)}
								</div>
							</div>
						)}
					</div>
					{isFiltered && (
						<button
							type="button"
							className="min-w-7 hover:bg-slate-3 rounded-e-lg min-h-9 hover:border hover:border-r-0 border-l border-border flex justify-center items-center text-slate-11"
							onClick={(e) => {
								e.stopPropagation();
								table.resetColumnFilters();
							}}
						>
							<Icons.Close className="min-w-4 max-w-4 min-h-4 max-h-4" />
						</button>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(option.value);
											} else {
												selectedValues.add(option.value);
											}
											const filterValues = Array.from(selectedValues);
											column?.setFilterValue(
												filterValues.length ? filterValues : undefined,
											);
										}}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-brand-9 text-primary-foreground border-brand-10"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className={cn("h-4 w-4")} />
										</div>
										{option.icon && (
											<option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
										)}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className="justify-center text-center"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
