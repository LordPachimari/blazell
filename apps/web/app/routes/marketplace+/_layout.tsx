import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { useReplicache } from "~/zustand/replicache";
import { Products } from "./components/products";

export default function MarketplaceLayout() {
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	return (
		<SidebarLayoutWrapper>
			<main className="p-2 lg:p-4 mt-16 flex justify-center ">
				<Products category="qwe" marketplaceRep={marketplaceRep} />
			</main>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
