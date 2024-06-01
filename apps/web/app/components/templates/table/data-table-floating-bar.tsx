import { DownloadIcon, ReloadIcon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import * as React from "react";

import { Icons } from "@blazell/ui/icons";
import { LoadingSpinner } from "@blazell/ui/loading";
import { Button } from "@pachi/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@pachi/ui/tooltip";
import { Card, CardContent } from "@blazell/ui/card";
import { toast } from "@blazell/ui/toast";

interface DataTableFloatingBarProps<TData extends { id: string }> {
	table: Table<TData>;
	onDelete: (keys: string[]) => void;
	onDuplicate: (keys: string[]) => void;
}

export function DataTableFloatingBar<TData extends { id: string }>({
	table,
	onDelete,
	onDuplicate,
}: DataTableFloatingBarProps<TData>) {
	const rows = table.getFilteredSelectedRowModel().rows;

	const [isPending, startTransition] = React.useTransition();
	const [method, setMethod] = React.useState<
		"update-status" | "update-priority" | "export" | "delete"
	>();

	// Clear selection on Escape key press
	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				table.toggleAllRowsSelected(false);
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [table]);
	console.log("rows", rows);

	return (
		<div className="fixed inset-x-0 bottom-10 rounded-2xl z-30 mx-auto w-fit px-4">
			<TooltipProvider>
				<div className="w-full overflow-x-auto">
					<Card className="mx-auto flex w-fit items-center gap-2 p-2 shadow-2xl">
						<CardContent className="flex items-center gap-1.5">
							<Tooltip delayDuration={250}>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										disabled={isPending}
										onClick={() => {
											onDuplicate(rows.map((row) => row.original.id));
											table.toggleAllRowsSelected(false);
											toast.success("Duplicated successfully.");
										}}
									>
										{isPending && method === "export" ? (
											<LoadingSpinner />
										) : (
											<Icons.copy
												className="text-mauve-11"
												aria-hidden="true"
												size={15}
											/>
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Duplicate</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip delayDuration={250}>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										disabled={isPending}
									>
										{isPending && method === "export" ? (
											<LoadingSpinner />
										) : (
											<DownloadIcon
												className="text-mauve-11"
												aria-hidden="true"
												fontSize={15}
											/>
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Export</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip delayDuration={250}>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="rounded-full"
										disabled={isPending}
										onClick={() => {
											onDelete(rows.map((row) => row.original.id));
											table.toggleAllRowsSelected(false);
											toast.success("Deleted successfully.");
										}}
									>
										<Icons.trash
											size={15}
											aria-hidden="true"
											className="text-ruby-9"
										/>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Delete tasks</p>
								</TooltipContent>
							</Tooltip>
						</CardContent>
					</Card>
				</div>
			</TooltipProvider>
		</div>
	);
}
