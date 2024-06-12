import { toast } from "@blazell/ui/toast";
import { generateID } from "@blazell/utils";
import type { Product } from "@blazell/validators/client";
import { useCallback, useTransition } from "react";
import { PageHeader } from "~/components/page-header";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
import { ProductsTable } from "./product-table/table";
import { useNavigate } from "@remix-run/react";

function ProductsPage() {
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");
	const products = useDashboardStore((state) =>
		state.products.filter((product) => product.storeID === activeStoreID),
	);

	return (
		<main className="p-4 md:p-10 w-full">
			<PageHeader title="Products" />
			<Products products={products} storeID={store?.id} />
		</main>
	);
}

export default ProductsPage;

function Products({
	products,
	storeID,
}: {
	products: Product[];
	storeID: string | undefined;
}) {
	const navigate = useNavigate();
	const [isPending, startTransition] = useTransition();
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const createProduct = useCallback(async () => {
		if (dashboardRep && storeID) {
			const productID = generateID({ prefix: "product" });

			await dashboardRep.mutate.createProduct({
				product: {
					id: productID,
					createdAt: new Date().toISOString(),
					status: "draft",
					discountable: true,
					storeID,
					version: 0,
					defaultVariantID: generateID({ prefix: "variant" }),
				},
			});
			toast.success("Product created successfully.");
			navigate(`/dashboard/products/${productID}`);
		}
	}, [dashboardRep, storeID]);
	const deleteProduct = useCallback(
		(keys: string[]) => {
			if (!dashboardRep) return;
			toast.promise(
				"Product deleted. Press CMD+Z to undo.",
				dashboardRep?.mutate.deleteProduct({ keys }),
			);
		},
		[dashboardRep],
	);
	const duplicateProduct = useCallback(
		async (keys: string[]) => {
			if (!dashboardRep) return;
			startTransition(() => {
				toast.promise(
					"Product duplicated",
					dashboardRep.mutate.duplicateProduct({
						duplicates: keys.map((id) => ({
							originalProductID: id,
							newDefaultVariantID: generateID({ prefix: "variant" }),
							newProductID: generateID({ prefix: "product" }),
							newOptionIDs: Array.from<string>({ length: 10 }).map(() =>
								generateID({ prefix: "p_option" }),
							),
							newOptionValueIDs: Array.from<string>({ length: 20 }).map(() =>
								generateID({ prefix: "p_op_val" }),
							),
							newPriceIDs: Array.from<string>({ length: 10 }).map(() =>
								generateID({ prefix: "price" }),
							),
						})),
					}),
					"Too many products to duplicate at once.",
				);
			});
		},
		[dashboardRep],
	);

	return (
		<ProductsTable
			products={products}
			createProduct={createProduct}
			deleteProduct={deleteProduct}
			duplicateProduct={duplicateProduct}
			isPending={isPending}
		/>
	);
}
