import { Card, CardContent, CardHeader, CardTitle } from "@blazell/ui/card";
import { Input } from "@blazell/ui/input";
import { Label } from "@blazell/ui/label";
import { Textarea } from "@blazell/ui/textarea";
import type { UpdateVariant } from "@blazell/validators";
import { useFormContext } from "react-hook-form";
import { FieldErrorMessage } from "~/components/field-error";
import type { DebouncedFunc } from "~/types/debounce";
import type { ProductForm } from "../product-input";

export function ProductInfo({
	title,
	description,
	onVariantInputChange,
	defaultVariantID,
}: {
	title: string | null | undefined;
	description: string | null | undefined;
	onVariantInputChange: DebouncedFunc<
		(updates: UpdateVariant) => Promise<void>
	>;
	defaultVariantID: string | undefined;
}) {
	const { formState } = useFormContext<ProductForm>();
	return (
		<Card className="mb-4">
			<CardHeader>
				<CardTitle className="pb-2">Product Details</CardTitle>
			</CardHeader>
			<CardContent>
				<span>
					<Label htmlFor="name">Title</Label>
					<Input
						type="text"
						defaultValue={title ?? ""}
						onChange={async (e) => {
							defaultVariantID &&
								(await onVariantInputChange({
									updates: { title: e.currentTarget.value },
									id: defaultVariantID,
								}));
						}}
						className="w-full my-2"
					/>
					<FieldErrorMessage message={formState.errors.title?.message} />
				</span>
				<div>
					<Label htmlFor="description" className="mt-4">
						Description
					</Label>
					<Textarea
						id="description"
						defaultValue={description ?? ""}
						className="min-h-32 mt-2"
						onChange={async (e) => {
							defaultVariantID &&
								(await onVariantInputChange({
									updates: { description: e.currentTarget.value },
									id: defaultVariantID,
								}));
						}}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
