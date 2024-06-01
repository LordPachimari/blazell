import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

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

interface ProductsTableProps {
	products: Product[];
	createProduct: () => Promise<void>;
	deleteProduct: (keys: string[]) => void;
	duplicateProduct: (keys: string[]) => void;
}

function ProductsTable({
	products,
	createProduct,
	deleteProduct,
	duplicateProduct,
}: Readonly<ProductsTableProps>) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo<ColumnDef<Product>[]>(
		() => getProductsColumns({ deleteProduct, duplicateProduct }),
		[deleteProduct],
	);
	const navigate = useNavigate();
	const table = useDataTable({
		columns,
		data: products,
	});

	return (
		<div className="space-y-4">
			<DataTableToolbar
				table={table}
				filterableColumns={filterableColumns}
				toolbarButton={
					<Button size="md" onClick={createProduct} type="button">
						<Icons.plus
							className="mr-1 font-bold"
							size={15}
							aria-hidden="true"
						/>
						New Product
					</Button>
				}
			/>
			<div className="shadow-md rounded-2xl">
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
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
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
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
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
											className="my-4"
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
