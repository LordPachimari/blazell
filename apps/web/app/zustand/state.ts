import type {
	Customer,
	LineItem,
	Order,
	Product,
	Variant,
} from "@blazell/validators/client";
import { create } from "zustand";

interface GalleryState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}

const useGalleryState = create<GalleryState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

interface CartState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}
const useCartState = create<CartState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

interface DashboardState {
	isInitialized: boolean;
	products: Product[];
	orders: Order[];
	customers: Customer[];
	setIsInitialized(newValue: boolean): void;

	setProducts(newValue: Product[]): void;
	setOrders(newValue: Order[]): void;
	setCustomers(newValue: Customer[]): void;
}

const useDashboardState = create<DashboardState>((set) => ({
	isInitialized: false,
	products: [],
	orders: [],
	customers: [],
	setIsInitialized: (isInitialized) => set({ isInitialized }),
	setProducts: (products) => set({ products }),
	setOrders: (orders) => set({ orders }),
	setCustomers: (customers) => set({ customers }),
}));

interface MarketplaceState {
	isInitialized: boolean;
	setIsInitialized(newValue: boolean): void;
}

const useMarketplaceState = create<MarketplaceState>((set) => ({
	isInitialized: false,
	setIsInitialized: (isInitialized) => set({ isInitialized }),
}));

export {
	useCartState,
	useDashboardState,
	useGalleryState,
	useMarketplaceState,
};
