import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import type { Order } from "@blazell/validators/client";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { orderStatuses } from "@blazell/validators";
import { OrderStatus } from "~/components/molecules/statuses/order-status";

export function getOrdersColumns(): ColumnDef<Order, unknown>[] {
	return [
		{
			accessorKey: "customer",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Customer" />
			),
			cell: ({ row }) => (
				<div className="w-[200px] flex gap-2">
					<Avatar className="h-10 w-10">
						<AvatarImage src={row.original.user?.avatar ?? undefined} />
						<AvatarFallback>
							{row.original.user?.username?.slice(0, 2).toUpperCase() ??
								row.original.fullName?.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="text-sm font-bold">{row.original.fullName}</p>
						<p className="text-sm">{row.original.email}</p>
					</div>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.original.status;

				if (!status) {
					return null;
				}

				return (
					<div className="flex w-[100px] items-center">
						<OrderStatus status={status} />
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return Array.isArray(value) && value.includes(row.getValue(id));
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "Date",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Date" />
			),
			cell: ({ row }) => {
				return <div className="w-[80px]">{row.original.createdAt}</div>;
			},

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
			cell: ({ row }) => {
				return (
					<div className="w-full flex justify-center">{`${row.original.currencyCode} ${row.original.total}`}</div>
				);
			},

			enableSorting: false,
			enableHiding: false,
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<Order>[] = [
	{
		id: "status",
		title: "Status",
		options: orderStatuses.map((status) => ({
			label: status[0]?.toUpperCase() + status.slice(1),
			value: status,
		})),
	},
];
