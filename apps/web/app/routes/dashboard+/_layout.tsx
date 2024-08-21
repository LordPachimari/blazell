// import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
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
import type { AuthUser } from "@blazell/validators";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { ThemeToggle } from "~/components/templates/layouts/theme-toggle";
import { useRequestInfo } from "~/hooks/use-request-info";
import { DashboardStoreProvider } from "~/zustand/store";
import { DashboardStoreMutator } from "~/zustand/store-mutator";
import { DashboardSearchCombobox } from "./search";
import { Button } from "@blazell/ui/button";
import { cn } from "@blazell/ui";
import { useDashboardState } from "~/zustand/state";
import { Icons, strokeWidth } from "@blazell/ui/icons";
export const loader: LoaderFunction = async (args) => {
	const { context } = args;
	const { authUser } = context;

	if (!authUser) {
		console.log("authUser not found", authUser);
		return redirect("/login");
	}
	if (!authUser.username) {
		return redirect("/onboarding");
	}
	return json(authUser);
};

export default function DashboardLayout() {
	return (
		<DashboardStoreProvider>
			<DashboardStoreMutator>
				<SidebarLayoutWrapper>
					<DashboardSidebarMobile />
					<DashboardSidebar>
						<DashboardNav />

						<Outlet />
					</DashboardSidebar>
				</SidebarLayoutWrapper>
			</DashboardStoreMutator>
		</DashboardStoreProvider>
	);
}
const DashboardNav = () => {
	const { userContext } = useRequestInfo();
	const { authUser } = userContext;
	const location = useLocation();

	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	const opened = useDashboardState((state) => state.opened);
	const setOpened = useDashboardState((state) => state.setOpened);
	return (
		<div className="h-14 flex items-center w-full fixed top-0 border-b bg-background border-border z-20 px-3">
			<div className="flex items-center flex-1">
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"bottom-4 bg-transparent left-3 size-10 z-50 md:hidden",
						{
							hidden: mainPath !== "dashboard",
						},
					)}
					onClick={() => setOpened(!opened)}
				>
					<Icons.Menu size={20} strokeWidth={strokeWidth} />
				</Button>
				<DynamicBreadcrumb />
			</div>

			<div className="flex-1 px-2">
				<DashboardSearchCombobox />
			</div>

			<div className="flex-1 flex justify-start items-center gap-2">
				<div className="hidden sm:block">
					<ThemeToggle />
				</div>
				{authUser && <ProfileDropdown authUser={authUser as AuthUser} />}
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
									<Link
										to={routeTo}
										className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									>
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
