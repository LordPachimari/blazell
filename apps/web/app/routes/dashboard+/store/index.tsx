import type { ActiveStoreID } from "@blazell/validators";
import type { Store as StoreType } from "@blazell/validators/client";
import { Store } from "~/components/templates/store/store";
import { ACTIVE_STORE_ID } from "~/constants";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";

export default function StoresPage() {
	const rep = useReplicache((state) => state.dashboardRep);
	const activeStoreID = ReplicacheStore.getByPK<ActiveStoreID>(
		rep,
		ACTIVE_STORE_ID,
	);
	console.log("active", activeStoreID);
	const stores = ReplicacheStore.scan<StoreType>(rep, "store") ?? [];
	const store = stores.find((store) => store.id === activeStoreID?.value ?? "");
	return (
		<section className="w-full p-4">
			<Store store={store} />
		</section>
	);
}

export { StoresPage };
