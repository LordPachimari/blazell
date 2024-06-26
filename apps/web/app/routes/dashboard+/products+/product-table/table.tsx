import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { Button } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import type { Product } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";
import { DataTableFloatingBar } from "~/components/templates/table/data-table-floating-bar";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import { filterableColumns, getProductsColumns } from "./columns";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { cn } from "@blazell/ui";
import type { DebouncedFunc } from "~/types/debounce";
interface ProductsTableProps {
	products: Product[];
	createProduct: () => Promise<void>;
	deleteProduct: (keys: string[]) => void;
	duplicateProduct: (keys: string[]) => void;
	isPending?: boolean;
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function ProductsTable({
	products,
	createProduct,
	deleteProduct,
	duplicateProduct,
	isPending = false,
	onSearch,
}: Readonly<ProductsTableProps>) {
	const columns = useMemo<ColumnDef<Product>[]>(
		() => getProductsColumns({ deleteProduct, duplicateProduct, isPending }),
		[deleteProduct, duplicateProduct, isPending],
	);
	const navigate = useNavigate();
	const table = useDataTable({
		columns,
		data: products,
	});
	const { rows } = table.getRowModel();

	const parentRef = React.useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 34,
		overscan: 20,
	});

	return (
		<div className="space-y-4 w-full">
			<DataTableToolbar
				table={table}
				filterableColumns={filterableColumns}
				toolbarButton={
					<Button size="md" onClick={createProduct} type="button">
						<Icons.Plus
							className="mr-1 font-bold "
							size={15}
							aria-hidden="true"
						/>
						New Product
					</Button>
				}
				{...(onSearch && { onSearch })}
			/>
			<ScrollArea
				ref={parentRef}
				className="h-[calc(100vh-327px)] shadow bg-component border border-border rounded-lg relative overflow-x-scroll"
			>
				<div style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="w-full sticky top-0 z-20 ">
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
									const row = rows[virtualRow.index] as Row<Product>;
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											style={{
												height: `${virtualRow.size}px`,
												transform: `translateY(${
													virtualRow.start - index * virtualRow.size
												}px)`,
											}}
											className={cn(
												row.getIsSelected() && isPending && "opacity-55",
											)}
											onClick={() =>
												navigate(`/dashboard/products/${row.original.id}`)
											}
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
										className="h-full text-center"
									>
										<div className="flex flex-col items-center gap-1 py-4 text-center">
											<h3 className="text-2xl font-bold font-freeman tracking-tight">
												You have no products
											</h3>
											<p className="text-sm text-muted-foreground">
												You can start selling as soon as you add a product.
											</p>
											<Button
												size="md"
												onClick={createProduct}
												type="button"
												className="my-2"
											>
												<PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
												New Product
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
			{table.getFilteredSelectedRowModel().rows.length > 0 && (
				<DataTableFloatingBar
					table={table}
					onDelete={deleteProduct}
					onDuplicate={duplicateProduct}
				/>
			)}
		</div>
	);
}

export { ProductsTable };
