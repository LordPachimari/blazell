import type { Replicache } from "replicache";
import { create } from "zustand";

import type { DashboardMutatorsType, UserMutatorsType } from "@pachi/core";

interface ReplicacheState {
	globalRep: Replicache | null;
	setGlobalRep: (rep: Replicache) => void;
	userRep: Replicache<UserMutatorsType> | null;
	setUserRep: (rep: Replicache<UserMutatorsType> | null) => void;
	dashboardRep: Replicache<DashboardMutatorsType> | null;
	setDashboardRep: (rep: Replicache<DashboardMutatorsType> | null) => void;
	marketplaceRep: Replicache | null;
	setMarketplaceRep: (rep: Replicache | null) => void;
}

export const useReplicache = create<ReplicacheState>((set) => ({
	userRep: null,
	setUserRep: (rep) => set({ userRep: rep }),
	dashboardRep: null,
	setDashboardRep: (rep) => set({ dashboardRep: rep }),
	globalRep: null,
	setGlobalRep: (rep) => set({ globalRep: rep }),
	marketplaceRep: null,
	setMarketplaceRep: (rep) => set({ marketplaceRep: rep }),
}));
