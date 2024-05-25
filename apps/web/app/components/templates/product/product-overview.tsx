import type {
	Product,
	ProductOption,
	Variant,
} from "@blazell/validators/client";
import { useEffect, useState } from "react";
import { Gallery } from "./gallery";
import { ProductContainer } from "./product-container";
import { GeneralInfo } from "./product-info";
import { Separator } from "@blazell/ui/separator";
import { AddToCart } from "./add-to-cart";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import { AspectRatio } from "@blazell/ui/aspect-ratio";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

interface ProductOverviewProps {
	product: Product | null | undefined;
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string | null;
	selectedVariant: Variant | null;
	setVariantIDOrHandle: (prop: string | null) => void;
	cartID?: string | undefined;
}

const ProductOverview = ({
	product,
	isDashboard = false,
	variants,
	setVariantIDOrHandle,
	selectedVariantIDOrHandle,
	selectedVariant,
	cartID,
}: ProductOverviewProps) => {
	console.log("variants", variants);
	console.log("product", product);
	return (
		<main className="relative lg:grid grid-cols-4 lg:grid-cols-7 w-full max-w-[1300px] mt-12  p-2 md:p-4">
			<Gallery
				images={
					selectedVariant?.images ?? product?.defaultVariant?.images ?? []
				}
			/>
			<ProductContainer>
				<div className="min-h-[60vh]">
					<GeneralInfo product={product} />
					<Separator className="my-4" />
					<ProductVariants
						variants={variants}
						{...(isDashboard && { isDashboard })}
						setVariantIDOrHandle={setVariantIDOrHandle}
						selectedVariantIDOrHandle={selectedVariantIDOrHandle}
					/>
					<ProductOptions
						options={product?.options ?? []}
						selectedVariant={selectedVariant}
						variants={variants}
						setVariantIDOrHandle={setVariantIDOrHandle}
					/>
				</div>

				<AddToCart
					{...(cartID && { cartID })}
					product={product}
					variant={selectedVariant ?? product?.defaultVariant}
					{...(isDashboard && { isDashboard })}
				/>
			</ProductContainer>
		</main>
	);
};
export { ProductOverview };

const ProductVariants = ({
	isDashboard,
	variants,
	selectedVariantIDOrHandle,
	setVariantIDOrHandle,
}: {
	isDashboard?: boolean;
	variants: Variant[];
	selectedVariantIDOrHandle: string | null;
	setVariantIDOrHandle: (prop: string | null) => void;
}) => {
	console.log(selectedVariantIDOrHandle);
	return (
		<section>
			<h2 className="py-2">Variant</h2>
			<ToggleGroup
				className="flex justify-start "
				type="single"
				value={selectedVariantIDOrHandle ?? ""}
				variant="outline"
				onValueChange={async (value) => {
					console.log("value", value);
					setVariantIDOrHandle(value);
				}}
			>
				{variants?.map((v) => (
					<ToggleGroupItem
						key={v.id}
						value={isDashboard ? v.id : v.handle ?? ""}
						className="bg-white min-w-[6rem] min-h-[9rem] p-0 rounded-xl hover:border-brand-3"
					>
						<AspectRatio ratio={2 / 3}>
							{!v.images?.[0] ? (
								<ImagePlaceholder />
							) : v.images?.[0].uploaded ? (
								<Image
									src={v.images?.[0].url}
									alt={v.images?.[0].name ?? "Product image"}
									className="rounded-xl"
								/>
							) : (
								<img
									src={toImageURL(v.images?.[0].base64, v.images?.[0].fileType)}
									alt={v.images?.[0].name ?? "Product image"}
									className="rounded-xl"
								/>
							)}
						</AspectRatio>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</section>
	);
};

const ProductOptions = ({
	options,
	selectedVariant,
	variants,
	setVariantIDOrHandle,
	isDashboard,
}: {
	options: ProductOption[];
	selectedVariant: Variant | null;

	setVariantIDOrHandle: (prop: string | null) => void;
	variants: Variant[];
	isDashboard?: boolean;
}) => {
	const [variantOptions, setVariantOptions] = useState<Record<string, string>>(
		{},
	);

	useEffect(() => {
		if (selectedVariant) {
			const variantOptions = (selectedVariant?.optionValues ?? []).reduce(
				(acc, curr) => {
					acc[curr.optionValue.optionID] = curr.optionValue.value;
					return acc;
				},
				{} as Record<string, string>,
			);
			setVariantOptions(variantOptions);
		} else {
			setVariantOptions({});
		}
	}, [selectedVariant]);
	console.log("variant options", variantOptions);
	console.log("selected variant", selectedVariant);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (Object.keys(variantOptions).length > 0) {
			let variantFound = false;
			for (const variant of variants) {
				let optionValuesEqual = true;
				for (const value of variant.optionValues ?? []) {
					if (
						variantOptions[value.optionValue.optionID] !==
						value.optionValue.value
					) {
						optionValuesEqual = false;
					}
				}
				if (optionValuesEqual) {
					variantFound = true;
					setVariantIDOrHandle(isDashboard ? variant.id : variant.handle);
					break;
				}
			}
			//variant not found
			if (!variantFound) setVariantIDOrHandle(null);
		}
	}, [variantOptions, isDashboard]);
	return (
		<section>
			{options.map((option) => {
				return (
					<div className="flex flex-col" key={option.id}>
						<span className="flex min-w-[4rem] py-2 items-center font-semibold text-base ">
							{option.name}
						</span>
						<ToggleGroup
							className="flex justify-start"
							type="single"
							value={variantOptions[option.id] ?? ""}
							variant="outline"
							onValueChange={async (value) => {
								setVariantOptions((prev) => ({
									...prev,
									[option.id]: value,
								}));
							}}
						>
							{option.optionValues?.map((v) => (
								<ToggleGroupItem
									key={v.id}
									value={v.value}
									className="bg-white"
								>
									{v.value}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
				);
			})}
		</section>
	);
};
