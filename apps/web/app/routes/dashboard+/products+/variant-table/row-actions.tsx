import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import { Button } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	// DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import type { Variant } from "@blazell/validators/client";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;

	setVariantID: (id: string | null) => void;
	deleteVariant: (id: string) => Promise<void>;
}

export function RowActions({
	row,
	setVariantID,
	deleteVariant,
}: DataTableRowActionsProps<Variant>) {
	// const task = taskSchema.parse(row.original);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-10 w-10 p-0 data-[state=open]:bg-muted"
					type="button"
				>
					<DotsHorizontalIcon className="h-8 w-8" />
					<span className="sr-only">Open menu</span>
				</Button>
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
					className="text-red-500 hover:text-red-600"
					onClick={async () => await deleteVariant(row.original.id)}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
