import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";

export default function MarketplaceLayout() {
	return (
		<SidebarLayoutWrapper>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
