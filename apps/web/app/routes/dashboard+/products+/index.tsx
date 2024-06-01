import { generateID, generateReplicachePK } from "@blazell/utils";
import { useCallback, useState } from "react";
import { useReplicache } from "~/zustand/replicache";
import { ReplicacheStore } from "~/replicache/store";
import { ACTIVE_STORE_ID } from "~/constants";
import { toast } from "@blazell/ui/toast";
import type { Product, Store } from "@blazell/validators/client";
import { PageHeader } from "~/components/page-header";
import { ProductsTable } from "./product-table/table";
import type { ActiveStoreID } from "@blazell/validators";
import { useNavigate } from "@remix-run/react";
import { set } from "zod";

function ProductsPage() {
	const rep = useReplicache((state) => state.dashboardRep);
	const activeStoreID = ReplicacheStore.getByPK<ActiveStoreID>(
		rep,
		ACTIVE_STORE_ID,
	);
	const stores = ReplicacheStore.scan<Store>(rep, "store");
	const store =
		stores?.find((store) => store.id === activeStoreID?.value) ?? stores?.[0];
	const products = ReplicacheStore.scan<Product>(rep, `product_${store?.id}`);

	return (
		<main className="p-10 w-full">
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
	products: Product[] | undefined;
	storeID: string | undefined;
}) {
	const navigate = useNavigate();
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
					replicachePK: generateReplicachePK({
						prefix: "product",
						filterID: storeID,
						id: productID,
					}),
					defaultVariantID: generateID({ prefix: "default_var" }),
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
			toast.promise(
				"Product duplicated",
				dashboardRep.mutate.duplicateProduct({
					duplicates: keys.map((id) => ({
						originalProductID: id,
						newDefaultVariantID: generateID({ prefix: "default_var" }),
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
			);
		},
		[dashboardRep],
	);

	return (
		<ProductsTable
			products={products ?? []}
			createProduct={createProduct}
			deleteProduct={deleteProduct}
			duplicateProduct={duplicateProduct}
		/>
	);
}
