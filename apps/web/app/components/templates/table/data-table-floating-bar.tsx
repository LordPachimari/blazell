import { DownloadIcon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@blazell/ui/button";
import { Card, CardContent } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { toast } from "@blazell/ui/toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@blazell/ui/tooltip";
import { Kbd } from "@blazell/ui/kbd";

interface DataTableFloatingBarProps<TData extends { id: string }> {
	table: Table<TData>;
	onDelete?: (keys: string[]) => void;
	onDuplicate?: (keys: string[]) => void;
}

export function DataTableFloatingBar<TData extends { id: string }>({
	table,
	onDelete,
	onDuplicate,
}: DataTableFloatingBarProps<TData>) {
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

	return (
		<div className="fixed left-1/2 -translate-x-1/2 bottom-20 lg:bottom-10 rounded-lg z-30 w-fit px-4">
			<TooltipProvider>
				<div className="w-full overflow-x-auto">
					<Card className="mx-auto flex w-fit items-center gap-2 p-2 shadow-2xl">
						<CardContent className="flex items-center gap-1.5">
							{onDuplicate && (
								<Tooltip delayDuration={250}>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											className="flex gap-3"
											onClick={() => {
												const rows = table.getFilteredSelectedRowModel().rows;
												if (rows.length > 20)
													return toast.error(
														"You can only duplicate 20 products at a time.",
													);
												onDuplicate(rows.map((row) => row.original.id));
												table.toggleAllRowsSelected(false);
											}}
										>
											<Icons.Copy
												className="text-slate-11"
												aria-hidden="true"
												size={15}
											/>
											<Kbd>C</Kbd>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Copy</p>
									</TooltipContent>
								</Tooltip>
							)}
							<Tooltip delayDuration={250}>
								<TooltipTrigger asChild>
									<Button variant="ghost" className="flex gap-3">
										<DownloadIcon
											className="text-slate-11"
											aria-hidden="true"
											fontSize={15}
										/>
										<Kbd>E</Kbd>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Export</p>
								</TooltipContent>
							</Tooltip>
							{onDelete && (
								<Tooltip delayDuration={250}>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											className="flex gap-3"
											onClick={() => {
												const rows = table.getFilteredSelectedRowModel().rows;
												onDelete(rows.map((row) => row.original.id));
												table.toggleAllRowsSelected(false);
											}}
										>
											<Icons.Trash
												size={15}
												aria-hidden="true"
												className="text-red-9"
											/>
											<Kbd>D</Kbd>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Delete products</p>
									</TooltipContent>
								</Tooltip>
							)}
						</CardContent>
					</Card>
				</div>
			</TooltipProvider>
		</div>
	);
}
