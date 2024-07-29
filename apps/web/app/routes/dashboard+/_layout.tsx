import type { User } from "@blazell/validators/client";
// import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import DashboardSidebar, { DashboardSidebarMobile } from "./sidebar";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@blazell/ui/breadcrumb";
import { authkitLoader, getSignInUrl } from "@workos-inc/authkit-remix";
import { ThemeToggle } from "~/components/templates/layouts/theme-toggle";
import { DashboardStoreProvider } from "~/zustand/store";
import { DashboardStoreMutator } from "~/zustand/store-mutator";
import { DashboardSearchCombobox } from "./search";
export const loader = (args: LoaderFunctionArgs) =>
	authkitLoader(
		args,
		async ({ auth }) => {
			if (!auth.user) {
				const signInUrl = await getSignInUrl();
				return redirect(signInUrl);
			}
			const user = await fetch(
				`${args.context.cloudflare.env.WORKER_URL}/users/id/${auth.user.id}`,
				{
					method: "GET",
				},
			).then((res) => res.json() as Promise<User | undefined>);
			if (!user) {
				return redirect("/onboarding");
			}
			return json(user);
		},
		{ ensureSignedIn: true },
	);

export default function DashboardLayout() {
	return (
		<DashboardStoreProvider>
			<DashboardStoreMutator>
				<SidebarLayoutWrapper>
					<DashboardSidebarMobile />
					<DashboardSidebar>
						<div className="relative md:pl-40 pt-14 w-full ">
							<DashboardNav />

							<Outlet />
						</div>
					</DashboardSidebar>
				</SidebarLayoutWrapper>
			</DashboardStoreMutator>
		</DashboardStoreProvider>
	);
}
const DashboardNav = () => {
	return (
		<div className="h-14 flex items-center w-full fixed top-0 border-b bg-background border-border z-20 px-3">
			<div className="flex items-center flex-1">
				<DynamicBreadcrumb />
			</div>

			<div className="flex-1 px-2">
				<DashboardSearchCombobox />
			</div>

			<div className="flex-1">
				<ThemeToggle />
			</div>
		</div>
	);
};

export function DynamicBreadcrumb() {
	const location = useLocation();
	const pathnames = location.pathname
		.split("/")
		.filter((x) => x)
		.slice(1);

	if (pathnames.length === 0) {
		return null;
	}
	return (
		<Breadcrumb className="px-2 hidden sm:flex">
			<BreadcrumbList>
				{pathnames.map((name, index) => {
					const routeTo = `/dashboard/${pathnames
						.slice(0, index + 1)
						.join("/")}`;
					const isLast = index === pathnames.length - 1;

					return (
						<BreadcrumbItem key={routeTo}>
							{isLast ? (
								<BreadcrumbPage className="text-slate-10">
									<p className="text-ellipsis max-w-[100px] text-brand-9 text-nowrap overflow-hidden">
										{`${name[0]?.toUpperCase()}${name.substring(1)}`}
									</p>
								</BreadcrumbPage>
							) : (
								<>
									<Link to={routeTo}>
										<BreadcrumbLink className="text-slate-10 overflow-hidden text-ellipsis w-[100px]">
											<p className="text-ellipsis max-w-[100px] text-nowrap overflow-hidden">
												{`${name[0]?.toUpperCase()}${name.substring(1)}`}
											</p>
										</BreadcrumbLink>
									</Link>
									<BreadcrumbSeparator />
								</>
							)}
						</BreadcrumbItem>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
