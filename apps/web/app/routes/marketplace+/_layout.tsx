import { Outlet } from "@remix-run/react";
import { useEffect } from "react";
import { useSubscribe } from "replicache-react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { useReplicache } from "~/zustand/replicache";
import { useMarketplaceState } from "~/zustand/state";

export default function MarketplaceLayout() {
	const { setIsInitialized } = useMarketplaceState();
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useSubscribe(
		marketplaceRep,
		async (tx) => {
			const isInitialized = await tx.get<string>("init");
			setIsInitialized(!!isInitialized);
		},
		{ dependencies: [], default: null },
	);
	return (
		<SidebarLayoutWrapper>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
