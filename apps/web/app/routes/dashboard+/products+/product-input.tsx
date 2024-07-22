import {
	ProductSchema,
	PublishedVariantSchema,
	type UpdateProduct,
	type UpdateVariant,
} from "@blazell/validators";

import { cn } from "@blazell/ui";
import { Badge } from "@blazell/ui/badge";
import { Button } from "@blazell/ui/button";
import { Ping } from "@blazell/ui/ping";
import { toast } from "@blazell/ui/toast";
import type { Product, Variant } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import { AlertDialogComponent } from "~/components/molecules/alert";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
import { Attributes } from "./input/product-attributes";
import { ProductInfo } from "./input/product-info";
import { Media } from "./input/product-media";
import { ProductOptions } from "./input/product-options";
import { Organize } from "./input/product-organize";
import { Pricing } from "./input/product-pricing";
import Stock from "./input/product-stock";
import { Variants } from "./input/product-variants";
export interface ProductInputProps {
	product: Product | undefined;
	productID: string;
	defaultVariant: Variant | undefined;
	setView: (value: "preview" | "input") => void;
}

const ProductFormSchema = ProductSchema.partial().and(
	PublishedVariantSchema.partial(),
);
export type ProductForm = z.infer<typeof ProductFormSchema>;

export function ProductInput({
	productID,
	product,
	defaultVariant,
	setView,
}: ProductInputProps) {
	const variants = useDashboardStore((state) =>
		state.variants.filter(
			(v) => v.productID === productID && v.id !== defaultVariant?.id,
		),
	);
	const [isOpen, setIsOpen] = useState(false);
	const [isOpen1, setIsOpen1] = useState(false);
	const methods = useForm<ProductForm>({
		resolver: zodResolver(ProductFormSchema),
		defaultValues: {
			id: product?.id,
			title: defaultVariant?.title,
			allowBackorder: defaultVariant?.allowBackorder,
			barcode: defaultVariant?.barcode,
			weight: defaultVariant?.weight,
			width: defaultVariant?.width,
			height: defaultVariant?.height,
			length: defaultVariant?.length,
			material: defaultVariant?.material,
			originCountry: defaultVariant?.originCountry,
			quantity: defaultVariant?.quantity,
			status: product?.status,
			description: defaultVariant?.description,
			handle: defaultVariant?.handle,
			sku: defaultVariant?.sku,
		},
	});
	console.log("errors", methods.formState.errors);
	const dashboardRep = useReplicache((state) => state.dashboardRep);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onPublish = useCallback(() => {
		/* check prices */
		if (!defaultVariant?.prices || defaultVariant.prices.length === 0) {
			toast.error("Please add price to the product");
			return;
		}
		if (defaultVariant.quantity <= 0) {
			console.log("defaultVariant.quantity", defaultVariant.quantity);
			toast.error("Please add quantity to the product");
			return;
		}
		if (!defaultVariant.title || defaultVariant.title === "") {
			methods.setError("title", {
				message: "Title is required",
			});
			toast.error("Please add title to the product");
			return;
		}
		const v0 = variants.find((variant) => variant.quantity <= 0);
		if (v0) {
			toast.error("Please add a quantity to all variants");
			return;
		}
		const v1 = variants.find(
			(variant) => (variant.optionValues ?? []).length === 0,
		);
		if (v1) {
			toast.error(
				`Please add a product option to variant ${
					v1.title ?? v1.optionValues?.[0] ?? ""
				}`,
			);
			return;
		}
		const v2 = variants.find((variant) => (variant.prices ?? []).length === 0);
		if (v2) {
			toast.error(
				`Please add price to the product variant "${
					v2.title ?? v2.optionValues?.[0]?.optionValue.value ?? ""
				}"`,
			);
			return;
		}

		setIsOpen(true);
	}, [defaultVariant, variants]);

	const updateProduct = useCallback(
		async (updates: UpdateProduct["updates"]) => {
			if (dashboardRep && productID) {
				await dashboardRep.mutate.updateProduct({
					id: productID,
					updates,
				});
			}
		},
		[dashboardRep, productID],
	);

	const updateVariant = useCallback(
		async (props: UpdateVariant) => {
			if (dashboardRep) {
				await dashboardRep.mutate.updateVariant({
					id: props.id,
					updates: props.updates,
				});
			}
		},
		[dashboardRep],
	);
	const navigate = useNavigate();

	const deleteProduct = useCallback(async () => {
		await dashboardRep?.mutate.deleteProduct({ keys: [productID] });
		toast.success("Product deleted!");
		navigate("/dashboard/products");
	}, [dashboardRep, productID, navigate]);
	const publishProduct = useCallback(async () => {
		await dashboardRep?.mutate.publishProduct({ id: productID });
		toast.success("Product published!");
	}, [dashboardRep, productID]);
	const totalStock = variants.reduce(
		(acc, curr) => acc + (curr.quantity ?? 0),
		0,
	);

	return (
		<FormProvider {...methods}>
			<form
				className="w-full flex justify-center"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
					}
				}}
			>
				<main className="relative flex flex-col min-h-screen pb-20 max-w-7xl w-full gap-3 min-[1200px]:flex min-[1200px]:flex-row min-w-[15rem] px-3">
					<AlertDialogComponent
						open={isOpen}
						setIsOpen={setIsOpen}
						title="Are you sure you want to publish? "
						description="All your followers will be notified."
						onContinue={async () => {
							await publishProduct();
						}}
					/>
					<AlertDialogComponent
						open={isOpen1}
						setIsOpen={setIsOpen1}
						title="Are you sure you want to delete? "
						onContinue={async () => {
							await deleteProduct();
						}}
					/>
					<div className="w-full flex flex-col lg:min-w-[44rem] xl:max-w-[50rem]">
						<section className="flex items-center justify-between h-16">
							<Badge
								variant="default"
								className={cn(
									"text-sm bg-jade-3 flex gap-2 text-jade-9 border-jade-5 sm:ml-0 h-8",
									{
										"bg-red-3 text-red-9 border-red-5":
											(defaultVariant?.quantity ?? 0) <= 0,
									},
								)}
							>
								<Ping
									className={cn("bg-jade-9", {
										"bg-red-9": (defaultVariant?.quantity ?? 0) <= 0,
									})}
								/>
								{totalStock > 0 ? "In stock" : "Out of stock"}
							</Badge>
							<div className="flex items-center gap-1 md:ml-auto lg:hidden">
								<DeleteOrPublish
									setView={setView}
									setIsOpen1={setIsOpen1}
									onPublish={onPublish}
								/>
							</div>
						</section>
						<section className="w-full flex flex-col gap-3">
							<ProductInfo
								updateProduct={updateProduct}
								defaultVariant={defaultVariant}
								product={product}
								updateVariant={updateVariant}
							/>
							<Media
								images={defaultVariant?.images ?? []}
								variantID={defaultVariant?.id}
							/>
							<ProductOptions
								options={product?.options ?? []}
								productID={productID}
							/>
							<Variants
								productID={productID}
								product={product}
								variants={variants}
								defaultVariant={defaultVariant}
								isPublished={product?.status === "published"}
							/>
							{variants.length === 0 && (
								<Stock variant={defaultVariant} updateVariant={updateVariant} />
							)}
						</section>
					</div>

					<div className="w-full flex flex-col min-[1200px]:max-w-[25rem]">
						<section className="hidden min-[1200px]:flex items-center order-1 justify-end gap-1 h-16">
							<DeleteOrPublish
								setView={setView}
								setIsOpen1={setIsOpen1}
								onPublish={onPublish}
							/>
						</section>
						<section className="flex flex-col gap-3 order-2 w-full">
							<Pricing
								isPublished={product?.status === "published"}
								variantID={defaultVariant?.id}
								prices={defaultVariant?.prices ?? []}
							/>
							<Organize product={product} />
							<Attributes
								variant={defaultVariant}
								updateVariant={updateVariant}
							/>
						</section>
					</div>
				</main>
			</form>
		</FormProvider>
	);
}

function DeleteOrPublish({
	setIsOpen1,
	onPublish,
	setView,
}: {
	setIsOpen1: (value: boolean) => void;
	onPublish: () => void;
	setView: (value: "preview" | "input") => void;
}) {
	return (
		<>
			<Button
				variant="outline"
				type="button"
				size="md"
				onClick={async () => {
					setView("preview");
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						setView("preview");
					}
				}}
			>
				Preview
			</Button>
			<Button
				variant="outline"
				type="button"
				size="md"
				className="text-red-9 hover:text-red-10 hover:border-red-7"
				onClick={async () => {
					setIsOpen1(true);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						setIsOpen1(true);
					}
				}}
			>
				Delete
			</Button>

			<Button
				size="md"
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onPublish();
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						onPublish();
					}
				}}
			>
				Publish
			</Button>
		</>
	);
}
