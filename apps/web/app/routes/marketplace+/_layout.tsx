import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { Products } from "./components/products";

export default function MarketplaceLayout() {
	return (
		<SidebarLayoutWrapper>
			<main className="p-2 lg:p-4 mt-16 flex justify-center ">
				<Products />
			</main>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
