// import { getAuth } from "@clerk/remix/ssr.server";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { SettingsSidebar } from "./sidebar";

export default function SettingsLayout() {
	return (
		<SidebarLayoutWrapper>
			<SettingsSidebar>
				<div className="md:pl-40 w-full ">
					<Outlet />
				</div>
			</SettingsSidebar>
		</SidebarLayoutWrapper>
	);
}
