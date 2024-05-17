import type { UpdateProduct } from "@pachi/validators";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@pachi/ui/card";
import { Input } from "@pachi/ui/input";
import { Label } from "@pachi/ui/label";
import { Textarea } from "@pachi/ui/textarea";
import type { DebouncedFunc } from "~/types/debounce";
import type { PublishedProduct } from "../product-input";

export function ProductInfo({
	title,
	description,
	onInputChange,
}: {
	title: string | null | undefined;
	description: string | null | undefined;
	onInputChange: DebouncedFunc<
		(props: UpdateProduct["updates"]) => Promise<void>
	>;
}) {
	const { register, formState } = useFormContext<PublishedProduct>();
	return (
		<Card className="mb-4">
			<CardHeader>
				<CardTitle className="pb-2">Product Details</CardTitle>
			</CardHeader>
			<CardContent>
				<span>
					<Label htmlFor="name">Title</Label>
					<Input
						id="name"
						type="text"
						// {...register("title")}
						// state={formState.errors.title ? "error" : "neutral"}
						// stateText={formState.errors.title?.message}
						onChange={async (e) => {
							await onInputChange({ title: e.currentTarget.value });
						}}
						className="w-full my-2"
					/>
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
							await onInputChange({ description: e.currentTarget.value });
						}}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
