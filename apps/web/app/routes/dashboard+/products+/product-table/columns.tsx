import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@blazell/ui/checkbox";
import { LoadingSpinner } from "@blazell/ui/loading";
import { productStatuses } from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { ProductStatus } from "~/components/molecules/statuses/product-status";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { toImageURL } from "~/utils/helpers";
import { useDashboardStore } from "~/zustand/store";
import { RowActions } from "./row-actions";

export function getProductsColumns({
	deleteProduct,
	duplicateProduct,
	isPending = false,
}: {
	deleteProduct: (keys: string[]) => void;
	duplicateProduct: (keys: string[]) => void;
	isPending?: boolean;
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
				const variantMap = useDashboardStore((state) => state.variantMap);
				const defaultVariant = variantMap.get(row.original.defaultVariantID);
				return (
					<div className="flex w-[50px] h-[50px] justify-center items-center border border-border   rounded-md">
						{isPending && row.getIsSelected() ? (
							<LoadingSpinner className="text-mauve-11" />
						) : !defaultVariant?.thumbnail ? (
							<ImagePlaceholder />
						) : defaultVariant?.thumbnail?.uploaded ? (
							<Image
								src={defaultVariant?.thumbnail?.url}
								alt={defaultVariant?.thumbnail?.name || "Uploaded image"}
								className="rounded-md h-full object-cover"
								fit="cover"
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
				const variantMap = useDashboardStore((state) => state.variantMap);
				const defaultVariant = variantMap.get(row.original.defaultVariantID);
				return (
					<div>
						<h1 className="font-freeman">
							{defaultVariant?.title ?? "Untitled"}
						</h1>
					</div>
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
				const variantMap = useDashboardStore((state) => state.variantMap);
				const defaultVariant = variantMap.get(row.original.defaultVariantID);
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
