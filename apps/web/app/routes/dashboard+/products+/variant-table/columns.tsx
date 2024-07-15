import type { ColumnDef } from "@tanstack/react-table";

import type { Product, Variant } from "@blazell/validators/client";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { toImageURL } from "~/utils/helpers";
import { RowActions } from "./row-actions";
import { Checkbox } from "@blazell/ui/checkbox";

export function getVariantColumns({
	setVariantID,
	deleteVariant,
	duplicateVariant,
}: {
	setVariantID: (id: string | null) => void;
	deleteVariant: (keys: string[]) => Promise<void>;
	duplicateVariant: (keys: string[]) => Promise<void>;
}): ColumnDef<Variant, unknown>[] {
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
					tabIndex={-1}
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
				<div className="flex w-[50px] h-[50px]  items-center rounded-md border border-border  ">
					{!row.original.images?.[0] ? (
						<ImagePlaceholder />
					) : row.original.images?.[0]?.uploaded ? (
						<Image
							src={row.original.images[0]?.url}
							alt={row.original.images[0]?.name || "Uploaded image"}
							className="rounded-md h-full w-full object-cover "
							fit="cover"
						/>
					) : (
						<img
							src={toImageURL(
								row.original.images[0]?.base64,
								row.original.images[0]?.fileType,
							)}
							alt={row.original.images[0]?.name || "Uploaded image"}
							className="rounded-md h-full w-full object-cover "
						/>
					)}
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
				return <div className="w-full">{info.getValue() as string}</div>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "quantity",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Stock" />
			),
			cell: (info) => {
				return <div className="w-full">{info.getValue() as string}</div>;
			},

			enableSorting: false,
			enableHiding: true,
		},

		{
			id: "actions",
			cell: ({ row }) => (
				<RowActions
					row={row}
					setVariantID={setVariantID}
					deleteVariant={deleteVariant}
					duplicateVariant={duplicateVariant}
				/>
			),
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<Product>[] = [];
