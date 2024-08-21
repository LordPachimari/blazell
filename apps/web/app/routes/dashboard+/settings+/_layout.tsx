import { Outlet } from "@remix-run/react";
import { SettingsSidebar } from "./sidebar";

export default function SettingsLayout() {
	return (
		<div className="">
			<SettingsSidebar>
				<Outlet />
			</SettingsSidebar>
		</div>
	);
}
