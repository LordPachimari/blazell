import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef, type Row } from "@tanstack/react-table";
import React, { useMemo, type KeyboardEvent } from "react";

import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import { Separator } from "@blazell/ui/separator";
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
import { useVirtualizer } from "@tanstack/react-virtual";
import { useHotkeys } from "react-hotkeys-hook";
import { DataTableFloatingBar } from "~/components/templates/table/data-table-floating-bar";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import type { DebouncedFunc } from "~/types/debounce";
import { filterableColumns, getProductsColumns } from "./columns";
interface ProductsTableProps {
	products: Product[];
	createProduct: () => Promise<void>;
	deleteProduct: (keys: string[]) => void;
	copyProduct: (keys: string[]) => void;
	isPending?: boolean;
	onSearch?: DebouncedFunc<(value: string) => void>;
}

function ProductsTable({
	products,
	createProduct,
	deleteProduct,
	copyProduct,
	isPending = false,
	onSearch,
}: Readonly<ProductsTableProps>) {
	const columns = useMemo<ColumnDef<Product>[]>(
		() => getProductsColumns({ deleteProduct, copyProduct, isPending }),
		[deleteProduct, copyProduct, isPending],
	);
	useHotkeys(["D"], () => {
		const rows = table.getFilteredSelectedRowModel().rows;
		console.log("rows", rows);
		deleteProduct(rows.map((r) => r.original.id));
		table.toggleAllPageRowsSelected(false);
	});
	useHotkeys(["C"], () => {
		const rows = table.getFilteredSelectedRowModel().rows;
		copyProduct(rows.map((r) => r.original.id));
		table.toggleAllPageRowsSelected(false);
	});
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
	const handleKeyDown = (
		e: KeyboardEvent<HTMLTableRowElement>,
		row: Row<Product>,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			navigate(`/dashboard/products/${row.original.id}`);
		}
		if (e.key === " ") {
			console.log("space");
			e.preventDefault();
			e.stopPropagation();
			row.toggleSelected(!row.getIsSelected());
		}
	};

	return (
		<div className="w-full">
			<DataTableToolbar
				className="p-4 border-b border-border"
				table={table}
				filterableColumns={filterableColumns}
				toolbarButton={
					<Button size="md" onClick={createProduct} type="button">
						Create
					</Button>
				}
				{...(onSearch && { onSearch })}
			/>
			<div
				ref={parentRef}
				className="h-[calc(63vh)] lg:h-[calc(66vh)] relative overflow-x-scroll"
			>
				<div style={{ height: `${virtualizer.getTotalSize()}px` }}>
					<Table>
						<TableHeader className="w-full z-20 sticky top-0 bg-component">
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
									const row = rows[virtualRow.index] as Row<Product>;
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											tabIndex={0}
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
											onKeyDown={(e) => handleKeyDown(e, row)}
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
										<div className="flex w-full h-full flex-col items-center gap-1 py-4 text-center">
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
			</div>
			<DataTablePagination
				table={table}
				className="p-4 border-t border-border"
			/>
			{table.getFilteredSelectedRowModel().rows.length > 0 && (
				<DataTableFloatingBar
					table={table}
					onDelete={deleteProduct}
					onDuplicate={copyProduct}
				/>
			)}
		</div>
	);
}

export { ProductsTable };
