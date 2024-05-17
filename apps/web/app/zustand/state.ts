import { create } from "zustand";

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
