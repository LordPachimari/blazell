import { PlusIcon } from "@radix-ui/react-icons";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

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
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { getCustomersColumns } from "./columns";
import type { Customer } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";

interface CustomersTableProps {
	customers: Customer[];
	createCustomer: () => Promise<void>;
}

function CustomersTable({
	customers,
	createCustomer,
}: Readonly<CustomersTableProps>) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo<ColumnDef<Customer>[]>(
		() => getCustomersColumns(),
		[],
	);
	const table = useDataTable({
		columns,
		data: customers,
	});
	const [parent] = useAutoAnimate({ duration: 100 });
	const navigate = useNavigate();

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
			/>
			<div className="shadow-md">
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
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row, index) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									onClick={() =>
										navigate(`/dashboard/customers/${row.original.id}`)
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
			<DataTablePagination table={table} />
		</div>
	);
}

export { CustomersTable };
