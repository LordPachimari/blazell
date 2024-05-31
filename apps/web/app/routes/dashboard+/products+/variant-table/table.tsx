import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@blazell/ui/table";
import type { UpdateVariant } from "@blazell/validators";
import type { Variant } from "@blazell/validators/client";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useDataTable } from "~/components/templates/table/use-data-table";
import { getVariantColumns } from "./columns";

interface VariantTableProps {
	variants: Variant[];
	setVariantID: (variant: string | null) => void;
	updateVariant: (props: UpdateVariant) => Promise<void>;

	deleteVariant: (id: string) => Promise<void>;
}
export default function VariantTable({
	variants,
	setVariantID,
	updateVariant,
	deleteVariant,
}: VariantTableProps) {
	const columns = useMemo<ColumnDef<Variant>[]>(
		() =>
			getVariantColumns({
				setVariantID,
				updateVariant,
				deleteVariant,
			}),
		[setVariantID, updateVariant, deleteVariant],
	);
	const table = useDataTable({
		columns,
		data: variants,
	});

	return (
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
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						);
					})
				) : (
					<TableRow>
						<TableCell
							colSpan={columns.length}
							className="h-24 text-center text-mauve-9"
						>
							No variants.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
