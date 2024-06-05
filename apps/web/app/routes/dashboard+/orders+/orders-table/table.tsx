import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button } from "@blazell/ui/button";
import { Ping } from "@blazell/ui/ping";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import type { Order } from "@blazell/validators/client";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import { useReplicache } from "~/zustand/replicache";
import { filterableColumns, getOrdersColumns } from "./columns";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@blazell/ui/scroll-area";

interface OrdersTableProps {
	orders: Order[];
	createOrder?: () => Promise<void>;
	setOrderID?: (id: string | undefined) => void;
	orderID?: string | undefined;
	toolbar?: boolean;
}

function OrdersTable({
	orders,
	createOrder,
	setOrderID,
	orderID,
	toolbar = true,
}: Readonly<OrdersTableProps>) {
	const columns = useMemo<ColumnDef<Order>[]>(() => getOrdersColumns(), []);
	const table = useDataTable({
		columns,
		data: orders,
	});
	const [parent] = useAutoAnimate({ duration: 100 });
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
		<div className="space-y-4">
			{toolbar && (
				<DataTableToolbar
					viewOptions={false}
					table={table}
					filterableColumns={filterableColumns}
					{...(createOrder && {
						toolbarButton: (
							<Button size="md" onClick={createOrder} type="button">
								<PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
								Custom Order
							</Button>
						),
					})}
				/>
			)}
			{dashboardRep?.online && (
				<div className="w-full flex items-center gap-2">
					<Ping />
					<p className="text-crimson-9 text-sm font-medium">real time</p>
				</div>
			)}
			<ScrollArea
				ref={parentRef}
				className="h-[calc(100vh-400px)] bg-component border border-mauve-7 rounded-2xl relative"
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
						<TableBody ref={parent}>
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
								<TableRow className="border-none hover:bg-component">
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<div className="flex flex-col items-center gap-1 py-4 text-center">
											<h3 className="text-2xl font-bold font-freeman tracking-tight">
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
			</ScrollArea>
			<DataTablePagination table={table} />
		</div>
	);
}

export { OrdersTable };
