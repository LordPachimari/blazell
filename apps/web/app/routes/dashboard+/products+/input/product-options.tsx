import { useAutoAnimate } from "@formkit/auto-animate/react";
import debounce from "lodash.debounce";
import { useCallback } from "react";

import type {
	DeleteProductOption,
	InsertProductOption,
	InsertProductOptionValue,
} from "@blazell/validators";

import { useEffect, useState } from "react";

import { Input } from "@blazell/ui/input";
import TagInput from "~/components/molecules/tag-input";

import { Button } from "@blazell/ui/button";
import { generateID } from "@blazell/utils";
import type { ProductOption } from "@blazell/validators/client";
import type { DebouncedFunc } from "~/types/debounce";
import { useReplicache } from "~/zustand/replicache";
import { Icons } from "@blazell/ui/icons";

interface CreateOptionProps {
	productID: string;
	options: ProductOption[] | undefined;
}

export function ProductOptions({ productID, options }: CreateOptionProps) {
	const { dashboardRep } = useReplicache();
	const createOption = useCallback(async () => {
		const id = generateID({ prefix: "p_option" });
		const option: InsertProductOption = { id, productID };
		await dashboardRep?.mutate.createProductOption({ option });
	}, [dashboardRep, productID]);
	const deleteOption = useCallback(
		async ({ optionID, productID }: DeleteProductOption) => {
			await dashboardRep?.mutate.deleteProductOption({
				optionID,
				productID,
			});
		},
		[dashboardRep],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onOptionNameChange = useCallback(
		debounce(async (optionID: string, name: string) => {
			await dashboardRep?.mutate.updateProductOption({
				optionID,
				productID,
				updates: { name },
			});
		}, 300),
		[dashboardRep],
	);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onOptionValuesChange = useCallback(
		debounce(async (optionID: string, values: string[]) => {
			const newOptionValues: InsertProductOptionValue[] = options
				? values.map((value) => ({
						id: generateID({ prefix: "p_op_val" }),
						optionID,
						value,
						option: options.find((o) => o.id === optionID),
					}))
				: [];
			await dashboardRep?.mutate.updateProductOptionValues({
				optionID,
				productID,
				newOptionValues,
			});
		}, 300),
		[dashboardRep, options],
	);

	const [parent] = useAutoAnimate({ duration: 100 });

	return (
		<section className="w-full my-4">
			<Button
				size="md"
				className="text-mauve-11"
				variant={"ghost"}
				type="button"
				onClick={createOption}
			>
				<Icons.PlusCircle className="h-3.5 w-3.5 mr-2" />
				Add option
			</Button>
			{options && options.length > 0 && (
				<div className="my-2 flex w-[calc(100%-40px)] gap-2">
					<label className="w-full text-sm font-bold">{"Option name"}</label>
					<label className="w-full text-sm font-bold">
						{"Option values (comma separated)"}
					</label>
				</div>
			)}
			<ul ref={parent} className="flex list-none flex-col gap-2 ">
				{options?.map((option) => (
					<li key={option.id} className="flex gap-2 items-center">
						<Option
							onOptionNameChange={onOptionNameChange}
							onOptionValuesChange={onOptionValuesChange}
							option={option}
						/>
						<button
							type="button"
							className="rounded-full bg-mauve-2 h-7 w-7 border hover:bg-mauve-3 border-mauve-7 flex justify-center items-center"
							onClick={async () =>
								await deleteOption({
									optionID: option.id,
									productID: productID,
								})
							}
						>
							<Icons.Close className="text-red-9" size={20} />
						</button>
					</li>
				))}
			</ul>
		</section>
	);
}

interface OptionProps {
	option: ProductOption;
	onOptionNameChange: DebouncedFunc<
		(id: string, name: string) => Promise<void>
	>;
	onOptionValuesChange: DebouncedFunc<
		(optionID: string, values: string[]) => Promise<void>
	>;
}

export default function Option({
	option,
	onOptionNameChange,
	onOptionValuesChange,
}: OptionProps) {
	const [values, setValues] = useState<string[]>([]);

	useEffect(() => {
		const values = option.optionValues?.map((v) => v.value) ?? [];
		setValues(values);
	}, [option.optionValues]);

	return (
		<div className="flex gap-2 w-full">
			<Input
				className="w-full md:w-[120px] text-sm"
				defaultValue={option.name ?? ""}
				placeholder="Size, color"
				onChange={async (e) => {
					await onOptionNameChange(option.id, e.target.value);
				}}
			/>
			<TagInput
				values={values}
				onChange={async (values) => {
					setValues(values as string[]);
					await onOptionValuesChange(option.id, values as string[]);
				}}
				className="w-full"
				placeholder="green, large (comma separated)"
			/>
		</div>
	);
}
