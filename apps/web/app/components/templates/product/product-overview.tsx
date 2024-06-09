import { cn } from "@blazell/ui";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type {
	Product,
	ProductOption,
	PublishedProduct,
	PublishedVariant,
	Variant,
} from "@blazell/validators/client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@blazell/ui/accordion";
import { useCallback, useEffect, useState } from "react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { toImageURL } from "~/utils/helpers";
import { Actions } from "./actions";
import { Gallery } from "./gallery";
import { GeneralInfo } from "./product-info";
import { Icons } from "@blazell/ui/icons";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";

interface ProductOverviewProps {
	product: Product | PublishedProduct | undefined;
	isDashboard?: boolean;
	variants: (Variant | PublishedVariant)[];
	selectedVariantIDOrHandle: string | undefined;
	selectedVariant: Variant | PublishedVariant | undefined;
	setVariantIDOrHandle: (prop: string | undefined) => void;
	cartID?: string | undefined;
	defaultVariant: Variant | PublishedVariant | undefined;
}

const ProductOverview = ({
	product,
	isDashboard = false,
	variants,
	setVariantIDOrHandle,
	selectedVariantIDOrHandle,
	selectedVariant,
	cartID,
	defaultVariant,
}: ProductOverviewProps) => {
	const isScrolled = useIsWindowScrolled();

	const [isShaking, setIsShaking] = useState(false);
	console.log("Shaking", isShaking);
	return (
		<main className="relative flex h-[calc(100vh + 70vh)] flex-col items-center  lg:items-start lg:grid grid-cols-4 lg:grid-cols-7 w-full max-w-[1300px] lg:mt-20 px-4">
			<div
				className={cn(
					"sticky top-0 lg:relative  transition-all col-span-4 duration-500 ease-in-out  w-full min-w-[20rem] lg:max-w-[40rem] gap-4",
					isScrolled && "brightness-50 lg:brightness-100",
				)}
			>
				<Gallery
					images={selectedVariant?.images ?? defaultVariant?.images ?? []}
				/>
				<ProductDetails product={product} className="hidden lg:block pt-10" />
			</div>

			<div
				className={cn(
					"lg:bg-mauve-a-2 dark:lg:bg-mauve-2 sticky lg:h-[85vh] top-20 lg:border lg:border-mauve-7 lg:rounded-2xl bg-mauve-2 lg:mt-0 dark:bg-mauve-3  w-full col-span-4 lg:col-span-3 p-4 rounded-t-lg z-20",
				)}
			>
				<GeneralInfo defaultVariant={defaultVariant} />
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
				<DeliveryOptions />
				<ProductDetails className="lg:hidden px-0 border-t" product={product} />
				<div className="h-[200px]" />
			</div>
		</main>
	);
};

export { ProductOverview };

const ProductDetails = ({
	product,
	className,
}: { product: Product | PublishedProduct | undefined; className?: string }) => {
	return (
		<Accordion
			type="single"
			className={cn("w-full px-8 pb-4", className)}
			collapsible
			defaultValue="item-1"
		>
			<AccordionItem value="item-1">
				<AccordionTrigger className="text-lg">
					Product description
				</AccordionTrigger>
				<AccordionContent className="text-base text-mauve-11">
					{product?.description}
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger className="text-lg">Specification</AccordionTrigger>
				<AccordionContent className="text-base text-mauve-11">
					Specifications include advanced processor capabilities, extensive
					storage options, and seamless connectivity. The product is designed to
					handle demanding tasks efficiently. Additional features include
					high-resolution display, long-lasting battery life, and intuitive user
					interface for enhanced productivity.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
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
				className="grid grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2 "
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
						className="relative w-[6rem] min-h-[6rem] p-0 "
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
const DeliveryOptions = () => {
	return (
		<div className="w-full py-4 pb-10 ">
			<h2 className="flex min-w-[4rem] py-2 items-center font-semibold text-base">
				Delivery options
			</h2>
			<ToggleGroup
				className="flex flex-col gap-1"
				type="single"
				/* eslint-disable */ // field has onChange method so it shouldn't be passed to radio group
				onChange={() => {}}
			>
				{Array.from({ length: 3 }).map((_, index) => (
					<ToggleGroupItem
						key={index}
						value={index.toString()}
						className="group w-full"
					>
						<div className="flex w-full items-center justify-between">
							<p className="">Delivery option {index + 1}</p>
							<Icons.CircleCheck className="size-6 text-white fill-crimson-9 opacity-0 transition group-data-[checked]:opacity-100" />
						</div>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
};
