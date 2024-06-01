import type { ActiveStoreID } from "@blazell/validators";
import type { Store as StoreType } from "@blazell/validators/client";
import { Store } from "~/components/templates/store/store";
import { ACTIVE_STORE_ID } from "~/constants";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardState } from "~/zustand/state";

export default function StoresPage() {
	const rep = useReplicache((state) => state.dashboardRep);
	const activeStoreID = ReplicacheStore.getByPK<ActiveStoreID>(
		rep,
		ACTIVE_STORE_ID,
	);
	const stores = ReplicacheStore.scan<StoreType>(rep, "store") ?? [];
	const store =
		stores.find((store) => store.id === activeStoreID?.value ?? "") ?? null;
	const isInitialized = useDashboardState((state) => state.isInitialized);
	return (
		<section className="w-full p-4 lg:p-10">
			<Store store={store} isInitialized={isInitialized} />
		</section>
	);
}

export { StoresPage };
