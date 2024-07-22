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
import { Icons } from "@blazell/ui/icons";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;

	setVariantID: (id: string | null) => void;
	deleteVariant: (keys: string[]) => Promise<void>;
}

export function RowActions({
	row,
	setVariantID,
	deleteVariant,
}: DataTableRowActionsProps<Variant>) {
	// const task = taskSchema.parse(row.original);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					buttonVariants({ size: "icon", variant: "ghost" }),
					"rounded-lg p-0 border-transparent hover:border-border hover:bg-slate-3",
				)}
			>
				<DotsHorizontalIcon className="h-4 w-4 text-slate-11" />
				<span className="sr-only">Open menu</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="w-[160px]">
				<DropdownMenuItem
					className="flex gap-2"
					onKeyDown={async (e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							setVariantID(row.original.id);
						}
					}}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						setVariantID(row.original.id);
					}}
				>
					<Icons.Edit size={14} /> Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex gap-2 "
					onClick={async (e) => {
						e.stopPropagation();
						await deleteVariant([row.original.id]);
					}}
					onKeyDown={async (e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							await deleteVariant([row.original.id]);
						}
					}}
				>
					<Icons.Trash size={14} />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
