import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import type { Variant } from "@blazell/validators/client";
import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";

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
			<DropdownMenuTrigger
				className={cn(
					buttonVariants({ size: "icon", variant: "ghost" }),
					"rounded-full",
				)}
			>
				<DotsHorizontalIcon className="h-4 w-4 text-mauve-11" />
				<span className="sr-only">Open menu</span>
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
