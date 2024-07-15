import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import type { Product } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";
import { Icons } from "@blazell/ui/icons";

interface DataTableRowActionsProps {
	row: Row<Product>;
	deleteProduct: (keys: string[]) => void;
	copyProduct: (keys: string[]) => void;
}

export function RowActions({
	row,
	deleteProduct,
	copyProduct,
}: DataTableRowActionsProps) {
	const navigate = useNavigate();

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
					onClick={async (e) => {
						e.stopPropagation();

						navigate(`/dashboard/products/${row.original.id}`);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							navigate(`/dashboard/products/${row.original.id}`);
						}
					}}
				>
					<Icons.Edit size={14} /> Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex gap-2"
					onClick={(e) => {
						e.stopPropagation();
						copyProduct([row.original.id]);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							copyProduct([row.original.id]);
						}
					}}
				>
					<Icons.Copy size={14} />
					Copy
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="flex gap-2"
					onClick={async (e) => {
						e.stopPropagation();
						deleteProduct([row.original.id]);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							e.stopPropagation();
							deleteProduct([row.original.id]);
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
