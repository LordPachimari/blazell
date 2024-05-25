import type { UpdateProduct, UpdateVariant } from "@blazell/validators";

import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@blazell/ui/badge";
import { Button } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import type { Product } from "@blazell/validators/client";
import { useNavigate } from "@remix-run/react";
import debounce from "lodash.debounce";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertDialogComponent } from "~/components/molecules/alert";
import { useReplicache } from "~/zustand/replicache";
import { ProductCategory } from "./input/product-category";
import { ProductInfo } from "./input/product-info";
import { Media } from "./input/product-media";
import { Pricing } from "./input/product-pricing";
import { ProductStatus } from "./input/product-status";
import Stock from "./input/product-stock";
import { Variants } from "./input/product-variants";
export interface ProductInputProps {
	product: Product | undefined | null;
	productID: string;
}

const PublishedProductSchema = z.object({
	title: z
		.string()
		.min(1, { message: "Title must contain at least 1 character" }),
});
export type PublishedProduct = z.infer<typeof PublishedProductSchema>;
export function ProductInput({ productID, product }: ProductInputProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isOpen1, setIsOpen1] = useState(false);
	const methods = useForm<PublishedProduct>({
		resolver: zodResolver(PublishedProductSchema),
	});

	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const onSubmit = (data: PublishedProduct) => {
		if (
			!product?.defaultVariant?.prices ||
			product?.defaultVariant.prices.length === 0
		)
			return toast.error("Please add a price to the product");
		return setIsOpen(true);
	};

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
		await dashboardRep?.mutate.deleteProduct({ id: productID });
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
				onSubmit={methods.handleSubmit(onSubmit)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
					}
				}}
			>
				<main className="relative table min-h-screen max-w-7xl w-full py-12  px-4 md:px-6 gap-4 xl:gap-6 xl:flex min-w-[15rem]">
					<Button
						variant="ghost"
						href="/dashboard/products"
						className="fixed text-black dark:text-white hover:bg-mauve-a-3 top-4 left-30  z-20"
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
						}}
					/>
					<AlertDialogComponent
						open={isOpen1}
						setIsOpen={setIsOpen1}
						title="Are you sure you want to delete? "
						description="This action is irreversible."
						onContinue={async () => {
							await deleteProduct();
							toast.success("Product deleted!");
						}}
					/>
					<div className="w-full flex flex-col lg:min-w-[44rem] max-w-[55rem]">
						<section className="flex items-center justify-between h-16">
							<Badge
								variant="outline"
								className="text-sm text-mauve-11 sm:ml-0 h-8"
							>
								In stock
							</Badge>
							<div className="flex items-center gap-2 md:ml-auto xl:hidden">
								<DeleteOrPublish setIsOpen1={setIsOpen1} />
							</div>
						</section>
						<section className="w-full table gap-0">
							<ProductInfo
								description={product?.description}
								onProductInputChange={onProductInputChange}
								title={product?.defaultVariant.title}
								defaultVariantID={product?.defaultVariant.id}
								onVariantInputChange={onVariantInputChange}
							/>
							<Media
								images={product?.defaultVariant.images ?? []}
								variantID={product?.defaultVariant.id}
							/>
							<Pricing
								variantID={product?.defaultVariant.id}
								prices={product?.defaultVariant.prices ?? []}
							/>
							<Variants
								options={product?.options}
								productID={product?.id}
								updateVariant={updateVariant}
							/>
							<Stock
								variant={product?.defaultVariant}
								updateVariant={updateVariant}
								onVariantInputChange={onVariantInputChange}
							/>
						</section>
					</div>

					<div className="w-full flex flex-col lg:min-w-[44rem] xl:min-w-[18rem] xl:max-w-[20rem]">
						<section className="hidden xl:flex items-center order-1 justify-end gap-4 h-16">
							<DeleteOrPublish setIsOpen1={setIsOpen1} />
						</section>
						<section className="flex flex-col gap-4 order-2 w-full">
							<ProductStatus
								status={product?.status}
								updateProduct={updateProduct}
								publishProduct={publishProduct}
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
}: {
	setIsOpen1: (value: boolean) => void;
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

			<Button size="md" type="submit">
				Publish
			</Button>
		</>
	);
}
