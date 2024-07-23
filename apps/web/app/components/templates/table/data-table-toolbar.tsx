import type { Table } from "@tanstack/react-table";

import { Input } from "@blazell/ui/input";

import { cn } from "@blazell/ui";
import type { DebouncedFunc } from "~/types/debounce";
import type { DataTableSearchableColumn, Option } from "~/types/table";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableFilterableColumn<TData>
	extends DataTableSearchableColumn<TData> {
	options: Option[];
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterableColumns?: DataTableFilterableColumn<TData>[] | undefined;
	toolbarButton?: React.ReactNode;
	viewOptions?: boolean;
	onSearch?: DebouncedFunc<(value: string) => void>;
	className?: string;
}

export function DataTableToolbar<TData>({
	filterableColumns,
	table,
	toolbarButton,
	viewOptions = true,
	onSearch,
	className,
}: Readonly<DataTableToolbarProps<TData>>) {
	return (
		<div className={cn("flex items-center justify-between", className)}>
			<div className="flex gap-2">
				<Input
					placeholder="Search"
					onChange={(event) => {
						onSearch?.(event.target.value);
					}}
					type="search"
					size="small"
					className="h-9 rounded-lg"
				/>
				<div className="flex flex-wrap">
					{filterableColumns?.map(
						(column) =>
							// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
							table.getColumn(String(column.id)) && (
								<DataTableFacetedFilter
									key={String(column.id)}
									column={table.getColumn(String(column.id))}
									title={column.title}
									options={column.options}
									table={table}
								/>
							),
					)}
				</div>
			</div>
			<div className="flex gap-2">
				<div className="w-fit">{toolbarButton}</div>
				{viewOptions && <DataTableViewOptions table={table} />}
			</div>
		</div>
	);
}
