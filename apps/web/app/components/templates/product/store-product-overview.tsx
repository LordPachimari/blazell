import { cn } from "@blazell/ui";
import { Card, CardContent } from "@blazell/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@blazell/ui/carousel";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type { Image as ImageType } from "@blazell/validators";
import type {
	Product,
	ProductOption,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazell/validators/client";
import { useCallback, useEffect, useState } from "react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { toImageURL } from "~/utils/helpers";
import { Actions } from "./actions";
import { GeneralInfo } from "./product-info";

interface StoreProductOverviewProps {
	product: Product | PublishedProduct | undefined;
	isDashboard?: boolean;
	variants: (Variant | PublishedVariant)[];
	selectedVariantIDOrHandle: string | undefined;
	selectedVariant: Variant | PublishedVariant | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	cartID?: string | undefined;
	defaultVariant: Variant | PublishedVariant | undefined;
	setView?: (value: "preview" | "input") => void;
}

const StoreProductOverview = ({
	product,
	isDashboard = false,
	variants,
	setVariantIDOrHandle,
	selectedVariantIDOrHandle,
	selectedVariant,
	cartID,
	defaultVariant,
	setView,
}: StoreProductOverviewProps) => {
	const [isShaking, setIsShaking] = useState(false);

	return (
		<main className="relative h-[calc(100vh + 70vh] flex flex-col lg:flex-row w-full">
			<Gallery
				images={selectedVariant?.images ?? defaultVariant?.images ?? []}
			/>

			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				className={cn("flex w-full col-span-3 ")}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={cn("w-full")}>
					<div className="p-4 h-full w-full">
						<GeneralInfo
							defaultVariant={defaultVariant}
							product={product}
							{...(setView && { setView })}
						/>
						<Actions
							{...(cartID && { cartID })}
							product={product}
							defaultVariant={defaultVariant}
							selectedVariant={selectedVariant}
							setIsShaking={setIsShaking}
							variants={variants}
							{...(isDashboard && { isDashboard })}
						/>
						<ProductVariants
							variants={variants}
							{...(isDashboard && { isDashboard })}
							setVariantIDOrHandle={setVariantIDOrHandle}
							selectedVariantIDOrHandle={selectedVariantIDOrHandle}
							isDashboard={isDashboard}
						/>
						<ProductOptions
							options={product?.options ?? []}
							selectedVariant={selectedVariant}
							variants={variants}
							setVariantIDOrHandle={setVariantIDOrHandle}
							isDashboard={isDashboard}
							isShaking={isShaking}
						/>
					</div>
				</div>
			</div>
		</main>
	);
};
export { StoreProductOverview };
interface GalleryProps {
	images: ImageType[];
}
const Gallery = ({ images }: GalleryProps) => {
	return (
		<div className="flex flex-col justify-center items-center w-full gap-4 lg:p-4 h-full">
			<Carousel>
				<CarouselContent className="shadow-none">
					{images.map(({ uploaded, base64, url, name, id, fileType }) => (
						<CarouselItem
							key={id}
							className={cn("shadow-none w-full flex justify-center")}
							onClick={(e) => e.stopPropagation()}
						>
							{!uploaded ? (
								<img
									alt={name}
									className={cn(
										"md:rounded-lg w-max max-w-full select-none object-contain object-center",
									)}
									src={toImageURL(base64, fileType)}
								/>
							) : (
								<Image
									src={url}
									className={cn(
										"lg:rounded-lg w-max max-w-full select-none object-contain object-center",
									)}
									quality={100}
									fit="contain"
								/>
							)}
						</CarouselItem>
					))}
					{images.length === 0 && (
						<CarouselItem className="aspect-square">
							<Card className="p-4 relative text-center shadow-none lg:shadow-md border-[0px] lg:border lg:border-border   height-full cursor-pointer aspect-square">
								<CardContent className="p-0 flex h-full justify-center items-center">
									<ImagePlaceholder size={30} />
								</CardContent>
							</Card>
						</CarouselItem>
					)}
				</CarouselContent>
				{images.length > 0 && (
					<>
						<CarouselPrevious onClick={(e) => e.stopPropagation()} />
						<CarouselNext onClick={(e) => e.stopPropagation()} />
					</>
				)}
			</Carousel>
		</div>
	);
};

const ProductVariants = ({
	isDashboard = false,
	variants,
	selectedVariantIDOrHandle,
	setVariantIDOrHandle,
}: {
	isDashboard?: boolean;
	variants: (Variant | PublishedVariant)[];
	selectedVariantIDOrHandle: string | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
}) => {
	if (variants.length === 0) return null;
	return (
		<section className="py-4">
			{variants.length > 0 && (
				<>
					<h2 className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
						Variant
					</h2>
				</>
			)}
			<ToggleGroup
				className="grid grid-cols-3 lg:grid-cols-3 gap-2 "
				type="single"
				value={selectedVariantIDOrHandle ?? ""}
				variant="outline"
				onValueChange={(value) => {
					setVariantIDOrHandle(value);
				}}
			>
				{variants?.map((v) => (
					<ToggleGroupItem
						key={v.id}
						value={isDashboard ? v.id : v.handle ?? ""}
						className="relative w-[6rem] min-h-[6rem] p-0"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="relative">
							{!v.images?.[0] ? (
								<ImagePlaceholder />
							) : v.images?.[0].uploaded ? (
								<Image
									src={v.images?.[0].url}
									alt={v.images?.[0].name ?? "Product image"}
									className="rounded-md"
									fit="cover"
									width={100}
								/>
							) : (
								<img
									src={toImageURL(v.images?.[0].base64, v.images?.[0].fileType)}
									alt={v.images?.[0].name ?? "Product image"}
									className="rounded-md object-cover"
								/>
							)}
						</div>
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
	isShaking,
}: {
	options: ProductOption[];
	selectedVariant: Variant | undefined;
	isShaking: boolean;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	variants: (Variant | PublishedVariant)[];
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

	const setVariant = useCallback(
		(options: Record<string, string>) => {
			if (Object.keys(options).length > 0) {
				let variantFound = false;
				for (const variant of variants) {
					let optionValuesEqual = true;
					if (variant.optionValues?.length === 0) optionValuesEqual = false;
					for (const value of variant.optionValues ?? []) {
						if (
							options[value.optionValue.optionID] !== value.optionValue.value
						) {
							optionValuesEqual = false;
						}
					}
					if (optionValuesEqual) {
						variantFound = true;
						setVariantIDOrHandle(
							isDashboard ? variant.id : variant.handle ?? undefined,
						);
						break;
					}
				}
				//variant not found
				if (!variantFound) setVariantIDOrHandle(undefined);
			}
		},
		[variants, setVariantIDOrHandle, isDashboard],
	);
	if (options.length === 0) return null;
	return (
		<section className="pb-4 grid grid-cols-2">
			{options.map((option) => {
				return (
					<div className="flex flex-col" key={option.id}>
						<span className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
							{`${(option.name ?? " ")[0]?.toUpperCase()}${option.name?.slice(
								1,
							)}`}
						</span>
						<ToggleGroup
							className={cn(
								"flex justify-start",
								isShaking && "animate-shake duration-300",
							)}
							type="single"
							value={variantOptions[option.id] ?? ""}
							onValueChange={async (value) => {
								const newVariantOptions = {
									...variantOptions,
									[option.id]: value,
								};
								setVariantOptions(newVariantOptions);
								setVariant(newVariantOptions);
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{option.optionValues?.map((val) => {
								const variant = variants.find((variant) => {
									return variant.optionValues?.some(
										(v) => v.optionValue.id === val.id,
									);
								});
								const isInStock = variant ? variant.quantity > 0 : false;
								return (
									<ToggleGroupItem
										key={val.id}
										value={val.value}
										disabled={!isInStock}
									>
										{val.value}
									</ToggleGroupItem>
								);
							})}
						</ToggleGroup>
					</div>
				);
			})}
		</section>
	);
};
