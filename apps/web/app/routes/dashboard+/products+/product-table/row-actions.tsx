import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";

import { Button } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import type { Product } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";
import { toast } from "@blazell/ui/toast";

interface DataTableRowActionsProps {
	row: Row<Product>;
	deleteProduct: (keys: string[]) => Promise<void>;
}

export function RowActions<TData>({
	row,
	deleteProduct,
}: DataTableRowActionsProps) {
	const navigate = useNavigate();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					type="button"
					className="flex rounded-full h-10 w-10 p-0 data-[state=open]:bg-muted"
				>
					<DotsHorizontalIcon className="h-4 w-4 md:h-8 md:w-8" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem
					onClick={async (e) => {
						e.stopPropagation();
						// await deleteProduct(row.original.id);
						navigate(`/dashboard/products/${row.original.id}`);
					}}
				>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={async (e) => {
						e.stopPropagation();
						// await deleteProduct(row.original.id);
						toast.success("Product duplicated");
					}}
				>
					Duplicate
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async (e) => {
						e.stopPropagation();
						await deleteProduct([row.original.id]);
						toast.success("Product deleted. Press Ctrl+Z to undo.");
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
