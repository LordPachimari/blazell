import type { ActiveStoreID } from "@blazell/validators";
import { useEffect } from "react";
import { useSubscribe } from "replicache-react";
import { useReplicache } from "./replicache";
import {
	useDashboardStore,
	useGlobalStore,
	useMarketplaceStore,
} from "./store";

export const GlobalStoreMutator = ({
	children,
}: { children: React.ReactNode }) => {
	const setIsInitialized = useGlobalStore((state) => state.setIsInitialized);
	const diffUsers = useGlobalStore((state) => state.diffUsers);
	const diffOrders = useGlobalStore((state) => state.diffOrders);
	const diffLineItems = useGlobalStore((state) => state.diffLineItems);
	const diffCarts = useGlobalStore((state) => state.diffCarts);

	const rep = useReplicache((state) => state.globalRep);

	useSubscribe(
		rep,
		async (tx) => {
			const isInitialized = await tx.get<string>("init");
			setIsInitialized(!!isInitialized);
		},
		{ dependencies: [], default: null },
	);

	useEffect(() => {
		return rep?.experimentalWatch(diffUsers, {
			prefix: "user",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffUsers]);
	useEffect(() => {
		return rep?.experimentalWatch(diffOrders, {
			prefix: "order",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffOrders]);
	useEffect(() => {
		return rep?.experimentalWatch(diffCarts, {
			prefix: "cart",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffCarts]);
	useEffect(() => {
		return rep?.experimentalWatch(diffLineItems, {
			prefix: "line_item",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffLineItems]);
	return <>{children}</>;
};

export const MarketplaceStoreMutator = ({
	children,
}: { children: React.ReactNode }) => {
	const setIsInitialized = useMarketplaceStore(
		(state) => state.setIsInitialized,
	);
	const diffProducts = useMarketplaceStore((state) => state.diffProducts);
	const diffVariants = useMarketplaceStore((state) => state.diffVariants);
	const rep = useReplicache((state) => state.marketplaceRep);
	useSubscribe(
		rep,
		async (tx) => {
			const isInitialized = await tx.get<string>("init");
			setIsInitialized(!!isInitialized);
		},
		{ dependencies: [], default: null },
	);

	useEffect(() => {
		return rep?.experimentalWatch(diffProducts, {
			prefix: "product",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffProducts]);

	useEffect(() => {
		return rep?.experimentalWatch(diffVariants, {
			prefix: "variant",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffVariants]);
	return <>{children}</>;
};
export const DashboardStoreMutator = ({
	children,
}: { children: React.ReactNode }) => {
	const setIsInitialized = useDashboardStore((state) => state.setIsInitialized);
	const diffStores = useDashboardStore((state) => state.diffStores);
	const diffCustomers = useDashboardStore((state) => state.diffCustomers);
	const diffOrders = useDashboardStore((state) => state.diffOrders);
	const diffLineItems = useDashboardStore((state) => state.diffLineItems);
	const diffProducts = useDashboardStore((state) => state.diffProducts);
	const diffVariants = useDashboardStore((state) => state.diffVariants);

	const setActiveStoreID = useDashboardStore((state) => state.setActiveStoreID);

	const rep = useReplicache((state) => state.dashboardRep);

	useSubscribe(
		rep,
		async (tx) => {
			const isInitialized = await tx.get<string>("init");
			const [activeStoreID] = await tx
				.scan<ActiveStoreID>({ prefix: "active" })
				.values()
				.toArray();
			setIsInitialized(!!isInitialized);
			setActiveStoreID(activeStoreID?.value ?? null);
		},
		{ dependencies: [], default: null },
	);
	useEffect(() => {
		return rep?.experimentalWatch(diffStores, {
			prefix: "store",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffStores]);
	useEffect(() => {
		return rep?.experimentalWatch(diffProducts, {
			prefix: "product",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffProducts]);
	useEffect(() => {
		return rep?.experimentalWatch(diffOrders, {
			prefix: "order",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffOrders]);
	useEffect(() => {
		return rep?.experimentalWatch(diffCustomers, {
			prefix: "user",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffCustomers]);
	useEffect(() => {
		return rep?.experimentalWatch(diffVariants, {
			prefix: "variant",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffVariants]);
	useEffect(() => {
		return rep?.experimentalWatch(diffLineItems, {
			prefix: "line_item",
			initialValuesInFirstDiff: true,
		});
	}, [rep, diffLineItems]);
	return <>{children}</>;
};
