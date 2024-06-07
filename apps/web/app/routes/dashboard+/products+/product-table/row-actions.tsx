import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import type { Product } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";

interface DataTableRowActionsProps {
	row: Row<Product>;
	deleteProduct: (keys: string[]) => void;
	duplicateProduct: (keys: string[]) => void;
}

export function RowActions({
	row,
	deleteProduct,
	duplicateProduct,
}: DataTableRowActionsProps) {
	const navigate = useNavigate();

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
					onClick={async (e) => {
						e.stopPropagation();

						navigate(`/dashboard/products/${row.original.id}`);
					}}
				>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						duplicateProduct([row.original.id]);
					}}
				>
					Duplicate
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async (e) => {
						e.stopPropagation();
						deleteProduct([row.original.id]);
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
