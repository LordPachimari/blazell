import { Store } from "~/components/templates/store/store";
import { useDashboardStore } from "~/zustand/store";

export default function StoresPage() {
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");
	const products = useDashboardStore((state) =>
		state.products.filter((product) => product.storeID === activeStoreID),
	);
	console.log("store", store);

	return (
		<section className="w-full p-3 flex justify-center">
			<Store store={store} isInitialized={isInitialized} products={products} />
		</section>
	);
}

export { StoresPage };
