import { Card, CardContent, CardHeader, CardTitle } from "@pachi/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@pachi/ui/select";
import { productStatuses, type UpdateProduct } from "@pachi/validators";
import type { Product } from "@pachi/validators/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertDialogComponent } from "~/components/molecules/alert";

export function ProductStatus({
	status,
	updateProduct,
	publishProduct,
}: {
	status: Product["status"] | undefined;
	updateProduct: (updates: UpdateProduct["updates"]) => Promise<void>;
	publishProduct: () => Promise<void>;
}) {
	const [open, setIsOpen] = useState(false);
	const [statusState, setStatusState] = useState<Product["status"]>(
		status ?? "draft",
	);
	useEffect(() => {
		if (status) setStatusState(status);
	}, [status]);

	return (
		<Card x-chunk="dashboard-07-chunk-3">
			<CardHeader className="pb-4">
				<CardTitle>Product Status</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-6">
					<div className="grid gap-3">
						<AlertDialogComponent
							open={open}
							setIsOpen={setIsOpen}
							title="Are you sure you want to publish?"
							description="All your followers will be notified."
							onContinue={async () => {
								await publishProduct();
								toast.success("Product published!");
							}}
						/>
						<Select
							value={statusState}
							onValueChange={async (value) => {
								if (value === "published") {
									return setIsOpen(true);
								}
								setStatusState(value as (typeof productStatuses)[number]);
								await updateProduct({
									status: value as (typeof productStatuses)[number],
								});
								toast.success("Product status updated!");
							}}
						>
							<SelectTrigger id="status" aria-label="Select status">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								{productStatuses.map((status) => (
									<SelectItem key={status} value={status}>
										{status}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
