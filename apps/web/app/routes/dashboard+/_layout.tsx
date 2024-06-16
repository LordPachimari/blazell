import type { User } from "@blazell/validators/client";
// import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import DashboardSidebar, { DashboardSidebarMobile } from "./sidebar";
import { DashboardStoreProvider } from "~/zustand/store";
import { DashboardStoreMutator } from "~/zustand/store-mutator";
import { userContext } from "~/sessions.server";
export const loader: LoaderFunction = async (args) => {
	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};
	if (!userContextCookie.fakeAuthID) {
		return redirect("/create-user");
	}
	// const { getToken, userId } = await getAuth(args);
	// if (!userId) return redirect("/sign-in");
	// const token = await getToken();
	const user = await fetch(`${args.context.cloudflare.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			// Authorization: `Bearer ${token}`,
			"x-fake-auth-id": userContextCookie.fakeAuthID,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (!user) {
		return redirect("/create-user");
	}
	return json(user);
};

export default function DashboardLayout() {
	return (
		<DashboardStoreProvider>
			<DashboardStoreMutator>
				<SidebarLayoutWrapper>
					<DashboardSidebarMobile />
					<DashboardSidebar>
						<div className="md:pl-40 w-full ">
							<Outlet />
						</div>
					</DashboardSidebar>
				</SidebarLayoutWrapper>
			</DashboardStoreMutator>
		</DashboardStoreProvider>
	);
}
