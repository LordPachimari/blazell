import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { MarketplaceStoreProvider } from "~/zustand/store";
import { MarketplaceStoreMutator } from "~/zustand/store-mutator";
import { Products } from "./components/products";
import { useReplicache } from "~/zustand/replicache";

export default function MarketplaceLayout() {
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	return (
		<MarketplaceStoreProvider>
			<MarketplaceStoreMutator>
				<SidebarLayoutWrapper>
					<main className="p-2 lg:p-4 mt-16 flex justify-center">
						<Products category="qwe" marketplaceRep={marketplaceRep} />
					</main>
					<Outlet />
				</SidebarLayoutWrapper>
			</MarketplaceStoreMutator>
		</MarketplaceStoreProvider>
	);
}
