import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { Button } from "@blazell/ui/button";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { getCustomersColumns } from "./columns";
import type { Customer } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { DebouncedFunc } from "~/types/debounce";

interface CustomersTableProps {
	customers: Customer[];
	createCustomer: () => Promise<void>;
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function CustomersTable({
	customers,
	createCustomer,
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
		<div className="space-y-4">
			<DataTableToolbar
				viewOptions={false}
				table={table}
				toolbarButton={
					<Button size="md" onClick={createCustomer} type="button">
						<PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
						Create customer
					</Button>
				}
				{...(onSearch && { onSearch })}
			/>

			<ScrollArea
				ref={parentRef}
				className="h-[calc(100vh-327px)] bg-component border rounded-2xl border-mauve-5 dark:border-mauve-7   relative"
			>
				<div style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="bg-mauve-a-2">
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
										<div className="flex flex-col items-center gap-1 py-4 text-center">
											<h3 className="text-2xl font-bold font-freeman tracking-tight">
												You have no customers
											</h3>
											<p className="text-sm text-muted-foreground">
												You can start selling as soon as you add a product.
											</p>
											<Button
												size="md"
												onClick={createCustomer}
												type="button"
												className="my-4"
											>
												<PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
												Customer Customer
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</ScrollArea>
			<DataTablePagination table={table} />
		</div>
	);
}

export { CustomersTable };
