import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "@blazell/ui/button";
import { Input } from "@blazell/ui/input";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import type { DataTableSearchableColumn, Option } from "~/types/table";

export interface DataTableFilterableColumn<TData>
	extends DataTableSearchableColumn<TData> {
	options: Option[];
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterableColumns?: DataTableFilterableColumn<TData>[] | undefined;
	toolbarButton?: React.ReactNode;
	viewOptions?: boolean;
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
}

export function DataTableToolbar<TData>({
	filterableColumns,
	table,
	toolbarButton,
	viewOptions = true,
}: Readonly<DataTableToolbarProps<TData>>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder="Search by customer..."
					// value={
					// 	(table.getColumn("fullName")?.getFilterValue() as string) ?? ""
					// }
					// onChange={(event) =>
					// 	table.getColumn("fullName")?.setFilterValue(event.target.value)
					// }
					className="h-10 w-[150px] md:w-[350px] rounded-xl"
				/>

				{filterableColumns?.map(
					(column) =>
						// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
						table.getColumn(String(column.id)) && (
							<DataTableFacetedFilter
								key={String(column.id)}
								column={table.getColumn(String(column.id))}
								title={column.title}
								options={column.options}
							/>
						),
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						type="button"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<div className="px-2 w-fit">{toolbarButton}</div>
			{viewOptions && <DataTableViewOptions table={table} />}
		</div>
	);
}
