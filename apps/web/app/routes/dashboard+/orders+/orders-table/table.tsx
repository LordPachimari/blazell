import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { Ping } from "@blazell/ui/ping";
import { Separator } from "@blazell/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import type { Order } from "@blazell/validators/client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import type { DebouncedFunc } from "~/types/debounce";
import { useReplicache } from "~/zustand/replicache";
import { filterableColumns, getOrdersColumns } from "./columns";

interface OrdersTableProps {
	orders: Order[];
	setOrderID?: (id: string | undefined) => void;
	orderID?: string | undefined;
	toolbar?: boolean;
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function OrdersTable({
	orders,
	setOrderID,
	orderID,
	toolbar = true,
	onSearch,
}: Readonly<OrdersTableProps>) {
	const columns = useMemo<ColumnDef<Order>[]>(() => getOrdersColumns(), []);
	const table = useDataTable({
		columns,
		data: orders,
	});
	const dashboardRep = useReplicache((state) => state.dashboardRep);

	const { rows } = table.getRowModel();

	const parentRef = React.useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});

	return (
		<div className="max-w-7xl w-full">
			{toolbar && (
				<DataTableToolbar
					className="px-4 "
					viewOptions={false}
					table={table}
					filterableColumns={filterableColumns}
					{...(onSearch && { onSearch })}
				/>
			)}
			{dashboardRep?.online && (
				<div className="w-full px-4 py-2 border-b border-border flex items-center gap-2">
					<Ping />
					<p className="text-brand-9 text-sm font-bold">Real time</p>
				</div>
			)}

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

							<Separator className="absolute top-10 bg-border" />
						</TableHeader>
						<TableBody>
							{rows.length ? (
								virtualizer.getVirtualItems().map((virtualRow, index) => {
									const row = rows[virtualRow.index] as Row<Order>;
									return (
										<TableRow
											key={row.id}
											data-state={row.original.id === orderID && "selected"}
											onClick={() => {
												setOrderID?.(row.original.id);
											}}
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
								<TableRow className="border-none h-full hover:bg-transparent">
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<div className="flex w-full h-full flex-col items-center gap-1 py-4 text-center">
											<h3 className="text-lg text-slate-11 font-freeman tracking-tight">
												You have no orders
											</h3>
											<p className="text-sm text-muted-foreground">
												But they may come any time soon
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

export { OrdersTable };
