import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { DashboardReplicacheProvider } from "~/providers/replicache/dashboard";
import DashboardSidebar from "./sidebar";
import type { User } from "@blazell/validators/client";
import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunction, json, redirect } from "@remix-run/cloudflare";
export const loader: LoaderFunction = async (args) => {
	const { getToken, userId } = await getAuth(args);
	if (!userId) return redirect("/sign-in");
	const token = await getToken();
	const user = await fetch(`${args.context.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (!user) {
		return redirect("/create-user");
	}
	return json(
		user,
		//  { headers: { "Cache-Control": "public, s-maxage=360" } }
	);
};

export default function DashboardLayout() {
	return (
		<SidebarLayoutWrapper>
			<DashboardSidebar>
				<main className="md:pl-40 w-full">
					<Outlet />
				</main>
			</DashboardSidebar>
		</SidebarLayoutWrapper>
	);
}
