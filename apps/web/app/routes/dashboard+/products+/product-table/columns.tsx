import { CrossCircledIcon, StopwatchIcon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleIcon } from "lucide-react";

import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { RowActions } from "./row-actions";
import type { Product } from "@blazell/validators/client";
import { Checkbox } from "@blazell/ui/checkbox";
import { productStatuses } from "@blazell/validators";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

function StatusIcon({ status }: { status: Product["status"] }) {
	return status === "draft" ? (
		<CrossCircledIcon
			className="mr-2 h-4 w-4 text-muted-foreground"
			aria-hidden="true"
		/>
	) : status === "published" ? (
		<StopwatchIcon
			className="mr-2 h-4 w-4 text-muted-foreground"
			aria-hidden="true"
		/>
	) : (
		<CircleIcon
			className="mr-2 h-4 w-4 text-muted-foreground"
			aria-hidden="true"
		/>
	);
}

export function getProductsColumns({
	deleteProduct,
}: {
	deleteProduct: (id: string) => Promise<void>;
}): ColumnDef<Product, unknown>[] {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					onClick={(e) => {
						e.stopPropagation();
					}}
					aria-label="Select row"
					className="translate-y-[2px]"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "thumbnail",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Thumbnail" />
			),
			cell: ({ row }) => (
				<div className="w-[100px]">
					<AspectRatio
						ratio={1}
						className="flex items-center border border-mauve-7 rounded-md"
					>
						{!row.original.defaultVariant?.thumbnail ? (
							<ImagePlaceholder />
						) : row.original.defaultVariant?.thumbnail?.uploaded ? (
							<Image
								src={row.original.defaultVariant?.thumbnail?.url}
								alt={
									row.original.defaultVariant?.thumbnail?.name ||
									"Uploaded image"
								}
								fit="cover"
								className="rounded-md h-full object-cover"
							/>
						) : (
							<img
								src={toImageURL(
									row.original.defaultVariant.thumbnail.base64,
									row.original.defaultVariant.thumbnail.fileType,
								)}
								alt={
									row.original.defaultVariant.thumbnail.name || "Uploaded image"
								}
								className="rounded-md h-full object-cover"
							/>
						)}
					</AspectRatio>
				</div>
			),
			enableSorting: false,
			enableHiding: true,
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title" />
			),
			cell: (info) => {
				return <div className="w-[80px]">{info.getValue() as string}</div>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "collection",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Collection" />
			),
			cell: ({ row }) => (
				<div className="w-[80px]">{row.original.collection?.handle}</div>
			),
			enableSorting: false,
			enableHiding: true,
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
						<StatusIcon status={status} />
						<span className="capitalize">{status}</span>
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
			accessorKey: "quantity",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Quantity" />
			),
			cell: (info) => {
				return <div className="w-[80px]">{info.getValue() as number}</div>;
			},

			enableSorting: false,
			enableHiding: true,
		},
		{
			id: "actions",
			cell: ({ row }) => <RowActions row={row} deleteProduct={deleteProduct} />,
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<Product>[] = [
	{
		id: "status",
		title: "Status",
		options: productStatuses.map((status) => ({
			label: status[0]?.toUpperCase() + status.slice(1),
			value: status,
		})),
	},
];
