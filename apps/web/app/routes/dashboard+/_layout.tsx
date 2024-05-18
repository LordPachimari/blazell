import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { DashboardReplicacheProvider } from "~/providers/replicache/dashboard";
import DashboardSidebar from "./sidebar";
import type { User } from "@pachi/validators/client";
import { getAuth } from "@clerk/remix/ssr.server";
import { env } from "~/env";
import { type LoaderFunction, json, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async (args) => {
	const { getToken, userId } = await getAuth(args);
	if (!userId) return redirect("/sign-in");
	const token = await getToken();
	const user = await fetch(`${env.WORKER_URL}/user`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (!user) {
		redirect("/create-user");
	}
	return json(user, { headers: { "Cache-Control": "public, s-maxage=60" } });
};

export default function DashboardLayout() {
	return (
		<DashboardReplicacheProvider>
			<SidebarLayoutWrapper>
				<DashboardSidebar>
					<main className="md:pl-44 w-full">
						<Outlet />
					</main>
				</DashboardSidebar>
			</SidebarLayoutWrapper>
		</DashboardReplicacheProvider>
	);
}
