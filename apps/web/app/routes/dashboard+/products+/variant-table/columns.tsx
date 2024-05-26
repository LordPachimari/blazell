import type { ColumnDef } from "@tanstack/react-table";

import type { UpdateVariant } from "@blazell/validators";

import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { DataTableColumnHeader } from "~/components/templates/table/data-table-column-header";
import type { DataTableFilterableColumn } from "~/types/table";
import { RowActions } from "./row-actions";
import type { Product, Variant } from "@blazell/validators/client";
import { AspectRatio } from "@blazell/ui/aspect-ratio";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

export function getVariantColumns({
	setVariantID,
	updateVariant,
	deleteVariant,
}: {
	setVariantID: (id: string | null) => void;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	deleteVariant: (id: string) => Promise<void>;
}): ColumnDef<Variant, unknown>[] {
	return [
		{
			accessorKey: "thumbnail",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Thumbnail" />
			),
			cell: ({ row }) => (
				<div className="w-[100px]">
					<AspectRatio
						ratio={1}
						className="flex items-center rounded-md border border-mauve-7"
					>
						{!row.original.images?.[0] ? (
							<ImagePlaceholder />
						) : row.original.images?.[0]?.uploaded ? (
							<Image
								src={row.original.images[0]?.url}
								alt={row.original.images[0]?.name || "Uploaded image"}
								className="rounded-md h-full object-cover "
								fit="contain"
								quality={90}
							/>
						) : (
							<img
								src={toImageURL(
									row.original.images[0]?.base64,
									row.original.images[0]?.fileType,
								)}
								alt={row.original.images[0]?.name || "Uploaded image"}
								className="rounded-md h-full object-cover "
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
				/>
			),
		},
	];
}
export const filterableColumns: DataTableFilterableColumn<Product>[] = [];
