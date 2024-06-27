import { Card, CardContent } from "@blazell/ui/card";
import type { UpdateVariant } from "@blazell/validators";
import { useFormContext } from "react-hook-form";
import TextAreaAutosize from "react-textarea-autosize";
import { FieldErrorMessage } from "~/components/field-error";
import type { DebouncedFunc } from "~/types/debounce";
import type { ProductForm } from "../product-input";
import { TextEditor } from "~/components/text-editor/text-editor";
import { useCallback } from "react";
export function ProductInfo({
	title,
	description,
	onVariantInputChange,
	defaultVariantID,
	updateVariant,
}: {
	title: string | null | undefined;
	description: string | null | undefined;
	onVariantInputChange: DebouncedFunc<
		(updates: UpdateVariant) => Promise<void>
	>;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	defaultVariantID: string | undefined;
}) {
	const { formState } = useFormContext<ProductForm>();
	const onDescriptionChange = useCallback(
		async (value: string) => {
			defaultVariantID &&
				(await updateVariant({
					id: defaultVariantID,
					updates: { description: value },
				}));
		},
		[updateVariant, defaultVariantID],
	);
	return (
		<Card className="mb-4 p-0">
			<CardContent className="rounded-lg w-full p-4">
				<TextAreaAutosize
					placeholder="Untitled"
					className="w-full prose max-w-none rounded-lg bg-transparent dark:text-white text-2xl outline-none font-bold"
					maxRows={2}
					autoFocus
					onChange={async (e) => {
						defaultVariantID &&
							(await onVariantInputChange({
								updates: { title: e.currentTarget.value },
								id: defaultVariantID,
							}));
					}}
					defaultValue={title ?? ""}
				/>

				<FieldErrorMessage message={formState.errors.title?.message} />
				<div>
					<Description
						description={description}
						onUpdate={onDescriptionChange}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
const Description = ({
	description,
	onUpdate,
}: {
	description: string | null | undefined;
	onUpdate: (value: string) => Promise<void>;
}) => {
	return <TextEditor content={description} onUpdate={onUpdate} />;
};
