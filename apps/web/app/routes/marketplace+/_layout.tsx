import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { MarketplaceStoreProvider } from "~/zustand/store";
import { MarketplaceStoreMutator } from "~/zustand/store-mutator";

export default function MarketplaceLayout() {
	return (
		<MarketplaceStoreProvider>
			<MarketplaceStoreMutator>
				<SidebarLayoutWrapper>
					<Outlet />
				</SidebarLayoutWrapper>
			</MarketplaceStoreMutator>
		</MarketplaceStoreProvider>
	);
}
