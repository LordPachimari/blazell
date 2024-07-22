import type { Table } from "@tanstack/react-table";

import { Button } from "@blazell/ui/button";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { cn } from "@blazell/ui";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	className?: string;
	pageSizes?: number[];
}

export function DataTablePagination<TData>({
	table,
	className,
	pageSizes = [100, 200, 300],
}: DataTablePaginationProps<TData>) {
	return (
		<div className={cn("flex items-center justify-between px-2", className)}>
			<div className="hidden md:block text-sm text-muted-foreground">
				{table.getFilteredSelectedRowModel().rows.length} of{" "}
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-2 ">
					<p className="hidden sm:block text-sm text-slate-11 font-medium">
						Rows per page
					</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px] text-slate-11">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{pageSizes.map((pageSize) => (
								<SelectItem
									key={pageSize}
									value={`${pageSize}`}
									className="text-slate-11"
								>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex text-slate-11">
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount() === 0 ? 1 : table.getPageCount()}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to first page</span>
							<Icons.DoubleLeft
								size={16}
								strokeWidth={strokeWidth}
								className="text-slate-11"
							/>
						</Button>
						<Button
							type="button"
							variant="outline"
							className="h-8 w-8 p-0"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to previous page</span>
							<Icons.Left
								size={16}
								strokeWidth={strokeWidth}
								className="text-slate-11"
							/>
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to next page</span>
							<Icons.Right
								size={16}
								strokeWidth={strokeWidth}
								className="text-slate-11"
							/>
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to last page</span>
							<Icons.DoubleRight
								size={16}
								strokeWidth={strokeWidth}
								className="text-slate-11"
							/>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
