import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import type { Customer } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import type { DebouncedFunc } from "~/types/debounce";
import { getCustomersColumns } from "./columns";

interface CustomersTableProps {
	customers: Customer[];
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function CustomersTable({
	customers,
	onSearch,
}: Readonly<CustomersTableProps>) {
	const columns = useMemo<ColumnDef<Customer>[]>(
		() => getCustomersColumns(),
		[],
	);
	const table = useDataTable({
		columns,
		data: customers,
	});

	const { rows } = table.getRowModel();
	const navigate = useNavigate();

	const parentRef = React.useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});

	return (
		<div className="max-w-7xl w-full">
			<DataTableToolbar
				className="p-4 pt-0 border-b border-border"
				viewOptions={false}
				table={table}
				{...(onSearch && { onSearch })}
			/>

			<div
				ref={parentRef}
				className="h-[calc(60vh)] lg:h-[calc(68vh)] relative overflow-x-scroll "
			>
				<div style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="w-full sticky top-0 bg-component">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{rows.length ? (
								virtualizer.getVirtualItems().map((virtualRow, index) => {
									const row = rows[virtualRow.index] as Row<Customer>;
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											onClick={() =>
												navigate(`/dashboard/customers/${row.original.id}`)
											}
											style={{
												height: `${virtualRow.size}px`,
												transform: `translateY(${
													virtualRow.start - index * virtualRow.size
												}px)`,
											}}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									);
								})
							) : (
								<TableRow className="border-none hover:bg-transparent">
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<div className="flex w-full h-full flex-col items-center gap-1 py-4 text-center">
											<h3 className="text-lg text-slate-11 font-freeman tracking-tight">
												You have no customers
											</h3>
											<p className="text-sm text-muted-foreground">
												We all start from zero.
											</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<DataTablePagination
				table={table}
				className="p-4 border-t border-border"
			/>
		</div>
	);
}

export { CustomersTable };
