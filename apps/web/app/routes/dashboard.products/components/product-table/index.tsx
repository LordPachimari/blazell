import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { Button } from "@pachi/ui/button";
import { filterableColumns, getProductsColumns } from "./columns";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { useDataTable } from "~/components/templates/table/use-data-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@pachi/ui/table";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { Link } from "@remix-run/react";
import type { Product } from "@pachi/validators/client";

interface ProductsTableProps {
	products: Product[];
	createProduct: () => Promise<void>;
	deleteProduct: (id: string) => Promise<void>;
}

function ProductsTable({
	products,
	createProduct,
	deleteProduct,
}: Readonly<ProductsTableProps>) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo<ColumnDef<Product>[]>(
		() => getProductsColumns({ deleteProduct }),
		[deleteProduct],
	);
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
						<PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
						New Product
					</Button>
				}
			/>
			<div className="shadow-md">
				<Table>
					<TableHeader>
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
									// onClick={() =>
									// 	router.push(`/dashboard/products/${row.original.id}`)
									// }
								>
									{row.getVisibleCells().map((cell) => (
										<Link
											key={row.original.id}
											to={`/dashboard/products/${row.original.id}`}
										>
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										</Link>
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
										<h3 className="text-2xl font-bold tracking-tight">
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
		</div>
	);
}

export { ProductsTable };
