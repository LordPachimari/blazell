import {
	ProductSchema,
	PublishedVariantSchema,
	type PublishedVariant,
	type UpdateProduct,
	type UpdateVariant,
} from "@blazell/validators";

import { Badge } from "@blazell/ui/badge";
import { Button } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import { toast } from "@blazell/ui/toast";
import type { Product, Variant } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import debounce from "lodash.debounce";
import { useCallback, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import { AlertDialogComponent } from "~/components/molecules/alert";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
import { ProductCategory } from "./input/product-category";
import { ProductInfo } from "./input/product-info";
import { Media } from "./input/product-media";
import { Pricing } from "./input/product-pricing";
import { ProductStatus } from "./input/product-status";
import Stock from "./input/product-stock";
import { Variants } from "./input/product-variants";
export interface ProductInputProps {
	product: Product | undefined;
	productID: string;
	defaultVariant: Variant | undefined | null;
}

const ProductFormSchema = ProductSchema.partial().and(
	PublishedVariantSchema.partial(),
);
export type ProductForm = z.infer<typeof ProductFormSchema>;

export function ProductInput({
	productID,
	product,
	defaultVariant,
}: ProductInputProps) {
	const variants = useDashboardStore((state) =>
		state.variants.filter(
			(v) => v.productID === productID && v.id !== defaultVariant?.id,
		),
	);
	const [isOpen, setIsOpen] = useState(false);
	const [isOpen1, setIsOpen1] = useState(false);
	const methods = useForm<PublishedVariant>({
		resolver: zodResolver(ProductFormSchema),
	});
	console.log("errors", methods.formState.errors);
	const dashboardRep = useReplicache((state) => state.dashboardRep);

	console.log("variants", variants);
	const publishButtonRef = useRef<HTMLButtonElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onPublish = useCallback(() => {
		/* check prices */
		if (!defaultVariant?.prices || defaultVariant.prices.length === 0) {
			toast.error("Please add a price to the product");
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
				`Please add a price to the product variant "${
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
	}, [dashboardRep, productID]);
	const publishProduct = useCallback(async () => {
		await dashboardRep?.mutate.publishProduct({ id: productID });
	}, [dashboardRep, productID]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onProductInputChange = useCallback(
		debounce(async (updates: UpdateProduct["updates"]) => {
			methods.clearErrors();
			await updateProduct(updates);
		}, 800),
		[updateProduct],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onVariantInputChange = useCallback(
		debounce(async (props: UpdateVariant) => {
			await updateVariant({ id: props.id, updates: props.updates });
		}, 800),
		[updateVariant],
	);

	return (
		<FormProvider {...methods}>
			<form
				className="w-full flex justify-center"
				onSubmit={methods.handleSubmit(onPublish)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
					}
				}}
			>
				<main className="relative table min-h-screen max-w-7xl w-full py-12  px-4 md:px-10 gap-4 xl:gap-6 xl:flex min-w-[15rem]">
					<Button
						variant="ghost"
						type="button"
						href="/dashboard/products"
						className="fixed text-mauve-11 dark:text-white top-4 left-30  z-20"
						onClick={() => navigate("/dashboard/products")}
					>
						<Icons.left size={20} className="text-black dark:text-white" />
						Back to products
					</Button>
					<AlertDialogComponent
						open={isOpen}
						setIsOpen={setIsOpen}
						title="Are you sure you want to publish? "
						description="All your followers will be notified."
						onContinue={async () => {
							await publishProduct();
							toast.success("Product published!");
							navigate("/dashboard/products");
						}}
					/>
					<AlertDialogComponent
						open={isOpen1}
						setIsOpen={setIsOpen1}
						title="Are you sure you want to delete? "
						onContinue={async () => {
							await deleteProduct();
							toast.success("Product deleted!");
							navigate("/dashboard/products");
							navigate("/dashboard/products");
						}}
					/>
					<div className="w-full flex flex-col lg:min-w-[44rem] xl:max-w-[55rem]">
						<section className="flex items-center justify-between h-16">
							<Badge
								variant="outline"
								className="text-sm text-mauve-11 sm:ml-0 h-8"
							>
								{(product?.defaultVariant.quantity ?? 0) > 0
									? "In stock"
									: "Out of stock"}
							</Badge>
							<div className="flex items-center gap-2 md:ml-auto xl:hidden">
								<DeleteOrPublish
									setIsOpen1={setIsOpen1}
									ref={publishButtonRef}
								/>
							</div>
						</section>
						<section className="w-full table gap-0">
							<ProductInfo
								description={product?.description}
								onProductInputChange={onProductInputChange}
								title={defaultVariant?.title}
								defaultVariantID={defaultVariant?.id}
								onVariantInputChange={onVariantInputChange}
							/>
							<Media
								images={defaultVariant?.images ?? []}
								variantID={defaultVariant?.id}
							/>
							<Pricing
								isPublished={product?.status === "published"}
								variantID={defaultVariant?.id}
								prices={defaultVariant?.prices ?? []}
							/>
							<Variants
								options={product?.options}
								productID={productID}
								variants={variants}
								defaultVariant={defaultVariant}
								isPublished={product?.status === "published"}
							/>
							<Stock
								variant={defaultVariant}
								updateVariant={updateVariant}
								onVariantInputChange={onVariantInputChange}
							/>
						</section>
					</div>

					<div className="w-full flex flex-col lg:min-w-[44rem] xl:min-w-[18rem] xl:max-w-[20rem]">
						<section className="hidden xl:flex items-center order-1 justify-end gap-4 h-16">
							<DeleteOrPublish setIsOpen1={setIsOpen1} ref={publishButtonRef} />
						</section>
						<section className="flex flex-col gap-4 order-2 w-full">
							<ProductStatus
								status={product?.status}
								updateProduct={updateProduct}
								onPublish={onPublish}
							/>
							<ProductCategory />
						</section>
					</div>
				</main>
			</form>
		</FormProvider>
	);
}

function DeleteOrPublish({
	setIsOpen1,
	ref,
}: {
	setIsOpen1: (value: boolean) => void;
	ref: React.RefObject<HTMLButtonElement>;
}) {
	return (
		<>
			<Button
				variant="outline"
				type="button"
				size="md"
				onClick={async () => {
					setIsOpen1(true);
				}}
			>
				Delete
			</Button>

			<Button size="md" type="submit" ref={ref}>
				Publish
			</Button>
		</>
	);
}
