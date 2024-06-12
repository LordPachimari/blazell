import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import type { Customer } from "@blazell/validators/client";

export function getCustomersColumns(): ColumnDef<Customer, unknown>[] {
	return [
		{
			accessorKey: "customer",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Customer" />
			),
			cell: ({ row }) => (
				<div className="w-[200px] flex gap-2">
					<Avatar className="h-10 w-10">
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>
							{row.original.username?.slice(0, 2).toUpperCase() ??
								row.original.fullName?.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="text-sm font-bold">
							{row.original.username ?? row.original.fullName}
						</p>
						<p className="text-sm">{row.original.email}</p>
					</div>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "Total",
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					className="w-full flex justify-center"
					title="Total"
				/>
			),
			cell: () => {
				return <div className="w-full flex justify-center">{69}</div>;
			},

			enableSorting: false,
			enableHiding: false,
		},
	];
}
