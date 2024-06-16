import type {
	Cart,
	Customer,
	LineItem,
	Order,
	Product,
	PublishedProduct,
	PublishedVariant,
	Store,
	User,
	Variant,
} from "@blazell/validators/client";
import React, { useEffect } from "react";
import type { ExperimentalDiff, ReadonlyJSONValue } from "replicache";
import { createStore, useStore } from "zustand";
import type { SearchWorkerRequest } from "~/worker/search";
type Entity = ReadonlyJSONValue & { id: string };
type ExtractState<S> = S extends {
	getState: () => infer T;
}
	? T
	: never;
function commonDiffReducer({
	diff,
	map,
	searchWorker,
}: {
	diff: ExperimentalDiff;
	map: Map<string, Entity>;
	searchWorker?: Worker | undefined;
}) {
	const newMap = new Map(map);
	function add(key: string, newValue: Entity) {
		newMap.set(key, newValue);
		searchWorker?.postMessage({
			type: "ADD",
			payload: {
				document: newValue,
			},
		} satisfies SearchWorkerRequest);
	}
	function del(key: string) {
		newMap.delete(key);

		searchWorker?.postMessage({
			type: "DELETE",
			payload: {
				key,
			},
		} satisfies SearchWorkerRequest);
	}
	function change(key: string, newValue: Entity) {
		newMap.set(key, newValue);
		searchWorker?.postMessage({
			type: "UPDATE",
			payload: {
				document: newValue,
			},
		} satisfies SearchWorkerRequest);
	}
	for (const diffOp of diff) {
		switch (diffOp.op) {
			case "add": {
				add(diffOp.key as string, diffOp.newValue as Entity);
				break;
			}
			case "del": {
				del(diffOp.key as string);
				break;
			}
			case "change": {
				change(diffOp.key as string, diffOp.newValue as Entity);
				break;
			}
		}
	}
	return { newEntities: Array.from(newMap.values()), newMap };
}

interface DashboardStore {
	searchWorker: Worker | undefined;
	isInitialized: boolean;
	activeStoreID: string | null;
	products: Product[];
	stores: Store[];
	orders: Order[];
	customers: Customer[];
	variants: Variant[];
	lineItems: LineItem[];
	productMap: Map<string, Product>;
	storeMap: Map<string, Store>;
	orderMap: Map<string, Order>;
	customerMap: Map<string, Customer>;
	variantMap: Map<string, Variant>;
	lineItemMap: Map<string, LineItem>;
	terminateSearchWorker(): void;
	setActiveStoreID(newValue: string | null): void;
	setIsInitialized(newValue: boolean): void;
	diffProducts(diff: ExperimentalDiff): void;
	diffOrders(diff: ExperimentalDiff): void;
	diffCustomers(diff: ExperimentalDiff): void;
	diffVariants(diff: ExperimentalDiff): void;
	diffLineItems(diff: ExperimentalDiff): void;
	diffStores(diff: ExperimentalDiff): void;
}
const createDashboardStore = () =>
	createStore<DashboardStore>((set, get) => ({
		searchWorker: undefined,
		isInitialized: false,
		activeStoreID: null,
		stores: [],
		products: [],
		orders: [],
		customers: [],
		variants: [],
		lineItems: [],
		productMap: new Map(),
		storeMap: new Map(),
		orderMap: new Map(),
		customerMap: new Map(),
		variantMap: new Map(),
		lineItemMap: new Map(),
		setActiveStoreID(newValue: string | null) {
			set({ activeStoreID: newValue });
		},
		setIsInitialized(newValue: boolean) {
			set({ isInitialized: newValue });
		},
		diffProducts(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().productMap,
			});
			set({
				products: newEntities as Product[],
				productMap: newMap as Map<string, Product>,
			});
		},
		diffOrders(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().orderMap,
				searchWorker: get().searchWorker,
			});
			set({
				orders: newEntities as Order[],
				orderMap: newMap as Map<string, Order>,
			});
		},
		diffCustomers(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().customerMap,
				searchWorker: get().searchWorker,
			});
			set({
				customers: newEntities as Customer[],
				customerMap: newMap as Map<string, Customer>,
			});
		},
		diffVariants(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().variantMap,
				searchWorker: get().searchWorker,
			});
			set({
				variants: newEntities as Variant[],
				variantMap: newMap as Map<string, Variant>,
			});
		},
		diffLineItems(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().lineItemMap,
			});
			set({
				lineItems: newEntities as LineItem[],
				lineItemMap: newMap as Map<string, LineItem>,
			});
		},
		diffStores(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().storeMap,
			});
			set({
				stores: newEntities as Store[],
				storeMap: newMap as Map<string, Store>,
			});
		},
		terminateSearchWorker() {
			get().searchWorker?.terminate();
			set({ searchWorker: undefined });
		},
	}));

const DashboardStoreContext = React.createContext<ReturnType<
	typeof createDashboardStore
> | null>(null);
const DashboardStoreProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [store] = React.useState(createDashboardStore);
	const state = store.getState();
	useEffect(() => {
		store.setState((state) => ({
			...state,
			searchWorker: new Worker(
				new URL("../worker/search.ts", import.meta.url),
				{ type: "module" },
			),
		}));

		return () => state.terminateSearchWorker();
	}, [store, state]);

	return (
		<DashboardStoreContext.Provider value={store}>
			{children}
		</DashboardStoreContext.Provider>
	);
};

const useDashboardStore = <_, U>(
	selector: (
		state: ExtractState<ReturnType<typeof createDashboardStore> | null>,
	) => U,
) => {
	const store = React.useContext(DashboardStoreContext);
	if (!store) {
		throw new Error("Missing DashboardProvider");
	}
	return useStore(store, selector);
};

interface MarketplaceStore {
	globalSearchWorker: Worker | undefined;
	isInitialized: boolean;
	products: PublishedProduct[];
	stores: Store[];
	variants: PublishedVariant[];
	productMap: Map<string, PublishedProduct>;
	storeMap: Map<string, Store>;
	variantMap: Map<string, PublishedVariant>;
	setIsInitialized(newValue: boolean): void;
	diffProducts(diff: ExperimentalDiff): void;
	diffVariants(diff: ExperimentalDiff): void;
	diffStores(diff: ExperimentalDiff): void;
	setGlobalSearchWorker(newValue: Worker): void;
}
const createMarketplaceStore = () =>
	createStore<MarketplaceStore>((set, get) => ({
		globalSearchWorker: undefined,
		isInitialized: false,
		activeStoreID: null,
		stores: [],
		products: [],
		variants: [],
		productMap: new Map(),
		storeMap: new Map(),
		variantMap: new Map(),
		setIsInitialized(newValue: boolean) {
			set({ isInitialized: newValue });
		},

		diffProducts(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().productMap,
			});
			set({
				products: newEntities as PublishedProduct[],
				productMap: newMap as Map<string, PublishedProduct>,
			});
		},
		diffVariants(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().variantMap,
				searchWorker: get().globalSearchWorker,
			});
			set({
				variants: newEntities as PublishedVariant[],
				variantMap: newMap as Map<string, PublishedVariant>,
			});
		},
		diffStores(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().storeMap,
				searchWorker: get().globalSearchWorker,
			});
			set({
				stores: newEntities as Store[],
				storeMap: newMap as Map<string, Store>,
			});
		},
		setGlobalSearchWorker(newValue: Worker) {
			set({ globalSearchWorker: newValue });
		},
	}));

const MarketplaceStoreContext = React.createContext<ReturnType<
	typeof createMarketplaceStore
> | null>(null);
const MarketplaceStoreProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [store] = React.useState(createMarketplaceStore);

	return (
		<MarketplaceStoreContext.Provider value={store}>
			{children}
		</MarketplaceStoreContext.Provider>
	);
};

const useMarketplaceStore = <_, U>(
	selector: (
		state: ExtractState<ReturnType<typeof createMarketplaceStore> | null>,
	) => U,
) => {
	const store = React.useContext(MarketplaceStoreContext);
	if (!store) {
		throw new Error("Missing MarketplaceProvider");
	}
	return useStore(store, selector);
};

interface GlobalStore {
	isInitialized: boolean;
	users: User[];
	orders: Order[];
	carts: Cart[];
	lineItems: LineItem[];
	userMap: Map<string, User>;
	cartMap: Map<string, Cart>;
	orderMap: Map<string, Order>;
	lineItemMap: Map<string, LineItem>;
	setIsInitialized(newValue: boolean): void;
	diffUsers(diff: ExperimentalDiff): void;
	diffCarts(diff: ExperimentalDiff): void;
	diffOrders(diff: ExperimentalDiff): void;
	diffLineItems(diff: ExperimentalDiff): void;
}
const createGlobalStore = () =>
	createStore<GlobalStore>((set, get) => ({
		isInitialized: false,
		carts: [],
		users: [],
		orders: [],

		lineItems: [],
		userMap: new Map(),
		cartMap: new Map(),
		orderMap: new Map(),
		lineItemMap: new Map(),

		setIsInitialized(newValue: boolean) {
			set({ isInitialized: newValue });
		},
		diffCarts(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().cartMap,
			});
			set({
				carts: newEntities as Cart[],
				cartMap: newMap as Map<string, Cart>,
			});
		},
		diffUsers(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().userMap,
			});
			set({
				users: newEntities as User[],
				userMap: newMap as Map<string, User>,
			});
		},
		diffOrders(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().orderMap,
			});
			set({
				orders: newEntities as Order[],
				orderMap: newMap as Map<string, Order>,
			});
		},
		diffLineItems(diff: ExperimentalDiff) {
			const { newEntities, newMap } = commonDiffReducer({
				diff,
				map: get().lineItemMap,
			});
			set({
				lineItems: newEntities as LineItem[],
				lineItemMap: newMap as Map<string, LineItem>,
			});
		},
	}));

const GlobalStoreContext = React.createContext<ReturnType<
	typeof createGlobalStore
> | null>(null);
const GlobalStoreProvider = ({ children }: { children: React.ReactNode }) => {
	const [store] = React.useState(createGlobalStore);

	return (
		<GlobalStoreContext.Provider value={store}>
			{children}
		</GlobalStoreContext.Provider>
	);
};

const useGlobalStore = <_, U>(
	selector: (
		state: ExtractState<ReturnType<typeof createGlobalStore> | null>,
	) => U,
) => {
	const store = React.useContext(GlobalStoreContext);
	if (!store) {
		throw new Error("Missing GlobalProvider");
	}
	return useStore(store, selector);
};

interface GlobalSearch {
	globalSearchWorker: Worker | undefined;
	terminateSearchWorker(): void;
}
const createGlobalSearch = () =>
	createStore<GlobalSearch>((set, get) => ({
		globalSearchWorker: undefined,
		terminateSearchWorker() {
			get().globalSearchWorker?.terminate();
			set({ globalSearchWorker: undefined });
		},
	}));

const GlobalSearchContext = React.createContext<ReturnType<
	typeof createGlobalSearch
> | null>(null);
const GlobalSearchProvider = ({ children }: { children: React.ReactNode }) => {
	const [store] = React.useState(createGlobalSearch);
	const state = store.getState();
	const setGlobalSearchWorker = useMarketplaceStore(
		(state) => state.setGlobalSearchWorker,
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const newWorker = new Worker(
			new URL("../worker/search.ts", import.meta.url),
			{ type: "module" },
		);
		store.setState((state) => ({
			...state,
			globalSearchWorker: newWorker,
		}));
		setGlobalSearchWorker(newWorker);

		return () => state.terminateSearchWorker();
	}, [store, state]);

	return (
		<GlobalSearchContext.Provider value={store}>
			{children}
		</GlobalSearchContext.Provider>
	);
};

const useGlobalSearch = <_, U>(
	selector: (
		state: ExtractState<ReturnType<typeof createGlobalSearch> | null>,
	) => U,
) => {
	const store = React.useContext(GlobalSearchContext);
	if (!store) {
		throw new Error("Missing GlobalSearchProvider");
	}
	return useStore(store, selector);
};

export {
	DashboardStoreProvider,
	GlobalStoreProvider,
	MarketplaceStoreProvider,
	GlobalSearchProvider,
	createDashboardStore,
	createGlobalStore,
	createMarketplaceStore,
	createGlobalSearch,
	useDashboardStore,
	useGlobalStore,
	useMarketplaceStore,
	useGlobalSearch,
};
