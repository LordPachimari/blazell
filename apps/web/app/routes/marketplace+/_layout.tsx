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
					<main className="p-4 mt-14 lg:mt-0 flex justify-center px-0 lg:p-10 lg:px-0 0">
						<div className="max-w-[1320px]">
							<Products category="qwe" marketplaceRep={marketplaceRep} />
						</div>
					</main>
					<Outlet />
				</SidebarLayoutWrapper>
			</MarketplaceStoreMutator>
		</MarketplaceStoreProvider>
	);
}
