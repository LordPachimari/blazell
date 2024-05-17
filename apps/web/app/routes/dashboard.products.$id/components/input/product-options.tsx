import { useAutoAnimate } from "@formkit/auto-animate/react";
import debounce from "lodash.debounce";
import { useCallback } from "react";

import type { DeleteProductOption } from "@pachi/validators";

import { useEffect, useState } from "react";

import { Input } from "@pachi/ui/input";
import TagInput from "~/components/molecules/tag-input";

import { Button } from "@pachi/ui/button";
import { generateID } from "@pachi/utils";
import type {
	InsertProductOption,
	InsertProductOptionValue,
	ProductOption,
} from "@pachi/validators/client";
import type { DebouncedFunc } from "~/types/debounce";
import { useReplicache } from "~/zustand/replicache";
import { Icons } from "@pachi/ui/icons";

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
		}, 800),
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
		}, 800),
		[dashboardRep, options],
	);

	const [parent] = useAutoAnimate(/* optional config */);

	return (
		<section className="w-full my-4">
			<Button
				className="bg-brand mt-2 flex w-full gap-2  md:w-fit border-[1px]"
				variant={"ghost"}
				type="button"
				onClick={createOption}
			>
				<Icons.plus fontSize={10} />
				Add option
			</Button>
			{options && options.length > 0 && (
				<div className="my-2 flex w-[calc(100%-40px)] gap-2">
					<label className="w-full text-sm font-bold">{"Option name"}</label>
					<label className="w-full text-sm font-bold">{"Option values "}</label>
				</div>
			)}
			<ul ref={parent} className="flex list-none flex-col gap-2 ">
				{options?.map((option) => (
					<li key={option.id} className="flex gap-2">
						<Option
							onOptionNameChange={onOptionNameChange}
							onOptionValuesChange={onOptionValuesChange}
							option={option}
						/>
						<Button
							size="icon"
							variant={"ghost"}
							type="button"
							onClick={async () =>
								await deleteOption({
									optionID: option.id,
									productID: productID,
								})
							}
						>
							<Icons.close className="text-red-500" />
						</Button>
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
