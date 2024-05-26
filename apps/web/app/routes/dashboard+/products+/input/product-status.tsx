import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { toast } from "@blazell/ui/toast";
import {
	productStatuses,
	type PublishedVariant,
	type UpdateProduct,
} from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AlertDialogComponent } from "~/components/molecules/alert";
import type { ProductForm } from "../product-input";

export function ProductStatus({
	status,
	updateProduct,
	publishProduct,
	publishButtonRef,
	onPublish,
}: {
	status: Product["status"] | undefined;
	updateProduct: (updates: UpdateProduct["updates"]) => Promise<void>;
	publishProduct: () => Promise<void>;
	publishButtonRef: React.RefObject<HTMLButtonElement>;
	onPublish: () => void;
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
						<Select
							value={statusState}
							onValueChange={async (value) => {
								if (value === "published") {
									return onPublish();
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
