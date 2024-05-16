import { enableMapSet } from "immer";
import { create } from "zustand";

enableMapSet();

interface GlobalState {
	sidebarOpen: boolean;
	setSidebarOpen: (val: boolean) => void;
}

export const useSidebarState = create<GlobalState>((set, get) => ({
	sidebarOpen: false,
	setSidebarOpen: (val: boolean) => set({ sidebarOpen: val }),
}));

interface GalleryState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}

const useGalleryState = create<GalleryState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

interface GalleryState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}

interface CartState {
	opened: boolean;
	setOpened(newValue: boolean): void;
}
const useCartState = create<GalleryState>((set) => ({
	opened: false,
	setOpened: (open) => set({ opened: open }),
}));

export { useGalleryState, useCartState };
