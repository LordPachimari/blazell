import { CrossCircledIcon, StopwatchIcon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleIcon } from "lucide-react";

import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { RowActions } from "./row-actions";
import type { Product, Variant } from "@blazell/validators/client";
import { Checkbox } from "@blazell/ui/checkbox";
import { productStatuses } from "@blazell/validators";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";
import { useReplicache } from "~/zustand/replicache";
import { ReplicacheStore } from "~/replicache/store";
import { generateReplicachePK } from "@blazell/utils";
import { ProductStatus } from "~/components/molecules/statuses/product-status";

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
	duplicateProduct,
}: {
	deleteProduct: (keys: string[]) => void;
	duplicateProduct: (keys: string[]) => void;
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
			cell: ({ row }) => {
				const dashboardRep = useReplicache((state) => state.dashboardRep);
				const defaultVariant = ReplicacheStore.getByPK<Variant>(
					dashboardRep,
					generateReplicachePK({
						prefix: "default_var",
						filterID: row.original.id,
						id: row.original.defaultVariantID,
					}),
				);
				return (
					<div className="flex w-[100px] h-[100px] items-center border border-mauve-7 rounded-md">
						{!defaultVariant?.thumbnail ? (
							<ImagePlaceholder />
						) : defaultVariant?.thumbnail?.uploaded ? (
							<Image
								src={defaultVariant?.thumbnail?.url}
								alt={defaultVariant?.thumbnail?.name || "Uploaded image"}
								className="rounded-md h-full object-cover"
								fit="fill"
								width={100}
								height={100}
							/>
						) : (
							<img
								src={toImageURL(
									defaultVariant.thumbnail.base64,
									defaultVariant.thumbnail.fileType,
								)}
								alt={defaultVariant.thumbnail.name || "Uploaded image"}
								className="rounded-md h-full w-full object-cover"
							/>
						)}
					</div>
				);
			},

			enableSorting: false,
			enableHiding: true,
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title" />
			),
			cell: ({ row }) => {
				const dashboardRep = useReplicache((state) => state.dashboardRep);
				const defaultVariant = ReplicacheStore.getByPK<Variant>(
					dashboardRep,
					generateReplicachePK({
						prefix: "default_var",
						filterID: row.original.id,
						id: row.original.defaultVariantID,
					}),
				);
				return (
					<h1 className="w-[80px] font-freeman text-ellipsis overflow-hidden lg:text-lg ">
						{defaultVariant?.title ?? ""}
					</h1>
				);
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
						<ProductStatus status={status} />
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
			cell: ({ row }) => {
				const dashboardRep = useReplicache((state) => state.dashboardRep);
				const defaultVariant = ReplicacheStore.getByPK<Variant>(
					dashboardRep,
					generateReplicachePK({
						prefix: "default_var",
						filterID: row.original.id,
						id: row.original.defaultVariantID,
					}),
				);
				return (
					<div className="w-[80px]">
						<h1 className="lg:text-md">{defaultVariant?.quantity ?? 1}</h1>
					</div>
				);
			},

			enableSorting: false,
			enableHiding: true,
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<RowActions
					row={row}
					deleteProduct={deleteProduct}
					duplicateProduct={duplicateProduct}
				/>
			),
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
