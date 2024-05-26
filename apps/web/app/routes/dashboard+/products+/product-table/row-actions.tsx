import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";

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

interface DataTableRowActionsProps {
	row: Row<Product>;
	deleteProduct: (id: string) => Promise<void>;
}

export function RowActions<TData>({
	row,
	deleteProduct,
}: DataTableRowActionsProps) {
	// const task = taskSchema.parse(row.original);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					type="button"
					className="flex h-10 w-10 p-0 data-[state=open]:bg-muted"
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
						toast.success("Product copied");
					}}
				>
					Make a copy
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={async (e) => {
						e.stopPropagation();
						await deleteProduct(row.original.id);
						toast.success("Product deleted");
					}}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
