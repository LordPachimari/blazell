import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import type { Variant } from "@blazell/validators/client";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useDataTable } from "~/components/templates/table/use-data-table";
import { getVariantColumns } from "./columns";
import { Separator } from "@blazell/ui/separator";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DataTableToolbar } from "~/components/templates/table/data-table-toolbar";
import { Button } from "@blazell/ui/button";
import type { DebouncedFunc } from "~/types/debounce";
import { DataTablePagination } from "~/components/templates/table/data-table-pagination";
import { DataTableFloatingBar } from "~/components/templates/table/data-table-floating-bar";

interface VariantTableProps {
	variants: Variant[];
	setVariantID: (variant: string | null) => void;
	generateVariants: () => void;
	deleteVariant: (keys: string[]) => Promise<void>;
	duplicateVariant: (keys: string[]) => Promise<void>;
	onSearch?: DebouncedFunc<(value: string) => void>;
}
export default function VariantTable({
	variants,
	setVariantID,
	generateVariants,
	deleteVariant,
	duplicateVariant,
	onSearch,
}: VariantTableProps) {
	const columns = useMemo<ColumnDef<Variant>[]>(
		() =>
			getVariantColumns({
				setVariantID,
				deleteVariant,
				duplicateVariant,
			}),
		[setVariantID, deleteVariant, duplicateVariant],
	);
	const table = useDataTable({
		columns,
		data: variants,
		pageSize: 10,
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
		<div className="w-full">
			<DataTableToolbar
				className="p-4 border-b border-border"
				table={table}
				toolbarButton={
					<Button
						size="md"
						onClick={generateVariants}
						variant="outline"
						type="button"
					>
						Generate
					</Button>
				}
				{...(onSearch && { onSearch })}
			/>
			<div
				ref={parentRef}
				className="min-h-[calc(20vh)] max-h-[calc-(50vh)] relative overflow-x-scroll"
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
							{table.getRowModel().rows.length > 0 ? (
								table.getRowModel().rows.map((row) => {
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											onClick={() => setVariantID(row.original.id)}
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
										className="h-24 text-center text-slate-9"
									>
										No variants.
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
				pageSizes={[10, 20, 30]}
			/>
			{table.getFilteredSelectedRowModel().rows.length > 0 && (
				<DataTableFloatingBar
					table={table}
					onDelete={deleteVariant}
					onDuplicate={duplicateVariant}
				/>
			)}
		</div>
	);
}
