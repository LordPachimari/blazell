import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import type { Variant } from "@blazell/validators/client";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;

	setVariantID: (id: string | null) => void;
	deleteVariant: (id: string) => Promise<void>;
	duplicateVariant: (keys: string[]) => Promise<void>;
}

export function RowActions({
	row,
	setVariantID,
	deleteVariant,
	duplicateVariant,
}: DataTableRowActionsProps<Variant>) {
	// const task = taskSchema.parse(row.original);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex border items-center justify-center border-mauve-7 rounded-full h-10 w-10 p-0 data-[state=open]:bg-muted"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<DotsHorizontalIcon className="h-4 w-4 text-mauve-11" />
					<span className="sr-only">Open menu</span>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem
					onClick={() => {
						setVariantID(row.original.id);
					}}
				>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={async (e) => {
						e.stopPropagation();
						await duplicateVariant([row.original.id]);
					}}
				>
					Duplicate
				</DropdownMenuItem>
				<DropdownMenuItem
					className="text-ruby-9"
					onClick={async (e) => {
						e.stopPropagation();
						await deleteVariant(row.original.id);
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
