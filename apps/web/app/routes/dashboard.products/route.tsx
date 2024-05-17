"use client";

import { generateID, generateReplicachePK } from "@pachi/utils";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { ReplicacheStore } from "~/replicache/store";
import { ACTIVE_STORE_ID } from "~/constants";
import { toast } from "@pachi/ui/toast";
import type { ActiveStoreID, Product, Store } from "@pachi/validators/client";
import { ProductsTable } from "./components/product-table";
import { PageHeader } from "~/components/page-header";

function ProductsPage() {
	const rep = useReplicache((state) => state.dashboardRep);
	const activeStoreID = ReplicacheStore.getByPK<ActiveStoreID>(
		rep,
		ACTIVE_STORE_ID,
	);
	const stores = ReplicacheStore.scan<Store>(rep, "store") ?? [];
	const store =
		stores.find((store) => store.id === activeStoreID?.value.storeID ?? "") ??
		stores[0];
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
	const dashboardRep = useReplicache((state) => state.dashboardRep);
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
				},
			});
			toast.success("Product created successfully");
		}
	}, [dashboardRep, storeID]);
	const deleteProduct = useCallback(
		async (id: string) => {
			await dashboardRep?.mutate.deleteProduct({ id });
		},
		[dashboardRep],
	);

	return (
		<ProductsTable
			products={products ?? []}
			createProduct={createProduct}
			deleteProduct={deleteProduct}
		/>
	);
}
