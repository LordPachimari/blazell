import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import {
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@blazell/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { GlobalSearchCombobox } from "~/components/search";
import { noHeaderPaths } from "~/constants";
import { useSidebarState } from "~/hooks/use-sidebar";
import { useWindowSize } from "~/hooks/use-window-size";
import type { action } from "~/routes/action.set-sidebar";
import { useDashboardState } from "~/zustand/state";
export type SidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
	items: [];
};
const items: SidebarItem[] = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: "Dashboard",
		items: [],
	},
	{
		title: "Marketplace",
		href: "/marketplace",
		icon: "Marketplace",
		items: [],
	},
	{
		title: "Auctions",
		href: "/auction",
		icon: "Billing",
		items: [],
	},
	{
		title: "Settings",
		href: "/settings",
		icon: "Settings",
		items: [],
	},
];

const noSidebarPaths = new Set(["/", "/sign-in", "/sign-up", "/onboarding"]);

const Sidebar = () => {
	const fetcher = useFetcher<typeof action>();
	const mode = useSidebarState();
	const nextMode = mode === "open" ? "closed" : "open";
	useHotkeys(["s"], () => {
		fetcher.submit(
			{ sidebarState: nextMode },
			{
				method: "post",
				action: "/action/set-sidebar",
			},
		);
	});
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	return (
		<div className="flex">
			<nav
				className={cn(
					"hidden group top-0 h-full justify-between lg:flex flex-col fixed z-40 w-14 overflow-hidden transition-all duration-200 ease-in-out hover:w-44 p-1 pr-0",
					{
						"w-44": mode === "open",
						"hidden lg:hidden": noSidebarPaths.has(location.pathname),
					},
				)}
			>
				<div className="h-full w-full flex flex-col justify-between rounded-lg border border-border bg-component backdrop-blur-sm lg:backdrop-blur-md">
					<div
						className={cn(
							"w-full flex justify-center pt-2 group-hover:justify-end group-hover:pr-2",
							{
								"justify-end pr-2": mode === "open",
							},
						)}
					>
						<Button
							size={"icon"}
							variant={"ghost"}
							className="text-slate-11 text-sm rounded-full"
							type="submit"
							onClick={() =>
								fetcher.submit(
									{ sidebarState: nextMode },
									{
										method: "post",
										action: "/action/set-sidebar",
									},
								)
							}
						>
							S
						</Button>
					</div>
					<div />
					<ul className="justify-center items-center flex w-full flex-col gap-4 px-2 py-6">
						{items.map((item) => {
							const Icon = Icons[item.icon ?? "chevronLeft"];

							return (
								<Link
									to={item.href}
									key={item.title}
									className={cn(
										"group/link flex size-10 w-full items-center gap-3 rounded-lg px-2 cursor-pointer hover:bg-slate-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-brand-7",
									)}
									prefetch="viewport"
								>
									<div className="flex justify-center ">
										<Icon
											className={cn(
												`/${mainPath}` === item.href
													? "text-brand-9"
													: "text-slate-11 group-hover/link:text-brand-9",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</div>
									<span
										className={cn(
											"w-[350px] text-slate-11 font-light opacity-0 group-hover/link:text-brand-9 transition-opacity duration-300 ease-in-out lg:group-hover:opacity-100",

											`/${mainPath}` === item.href && "text-brand-9",
											mode === "open" ? "opacity-100" : "opacity-0",
										)}
									>
										{item.title}
									</span>
								</Link>
							);
						})}
					</ul>
					<div />
				</div>
			</nav>
		</div>
	);
};

const MobileSidebar = () => {
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	const opened = useDashboardState((state) => state.opened);
	const setOpened = useDashboardState((state) => state.setOpened);
	const windowSize = useWindowSize(100);

	return (
		<div className="flex">
			<nav
				className={cn(
					"fixed lg:hidden h-14 group bottom-0 w-[calc(100%-6px)] bg-component justify-between flex flex-col z-40 overflow-hidden backdrop-blur-sm border-t border-border",
					{
						hidden: noSidebarPaths.has(location.pathname),
					},
				)}
			>
				<ul className="justify-evenly items-center flex w-full h-full gap-4 p-2">
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"bottom-4 bg-transparent border-none left-3 size-10 z-50 md:hidden",
							{
								hidden: mainPath !== "dashboard",
							},
						)}
						onClick={() => setOpened(!opened)}
					>
						<Icons.Dashboard size={20} strokeWidth={strokeWidth} />
					</Button>

					<DialogSidebar />
					{windowSize.width < 1024 && !noHeaderPaths(location.pathname) && (
						<GlobalSearchCombobox />
					)}
				</ul>
			</nav>
		</div>
	);
};
export const DialogSidebar = () => {
	const [opened, setOpened] = React.useState(false);
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	return (
		<DialogRoot
			shouldScaleBackground={true}
			direction={mainPath === "dashboard" ? "right" : "left"}
			open={opened}
			onOpenChange={setOpened}
		>
			<DialogTrigger className="px-2">
				<Icons.Menu className="text-slate-11" />
			</DialogTrigger>
			<DialogContent className="w-72 py-4 bg-component h-screen m-0 rounded-none ">
				<div className="h-full w-full flex flex-col justify-between">
					<ul className="justify-center items-center flex w-full flex-col gap-4 px-2 py-6">
						{items.map((item) => {
							const Icon = Icons[item.icon ?? "chevronLeft"];

							return (
								<Link
									to={item.href}
									key={item.title}
									onClick={() => setOpened(false)}
									className={cn(
										"group/link flex h-12 lg:h-10 w-full items-center gap-3 rounded-lg px-2 cursor-pointer hover:bg-slate-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-brand-7",
									)}
									prefetch="viewport"
								>
									<div className="flex justify-center ">
										<Icon
											className={cn(
												`/${mainPath}` === item.href
													? "text-brand-9"
													: "text-slate-11 group-hover/link:text-brand-9",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</div>
									<span
										className={cn(
											"w-[350px] text-slate-11 font-light opacity-group-hover/link:text-brand-9",

											`/${mainPath}` === item.href && "text-brand-9",
										)}
									>
										{item.title}
									</span>
								</Link>
							);
						})}
					</ul>
					<div />
				</div>
			</DialogContent>
		</DialogRoot>
	);
};

export { MobileSidebar, Sidebar };
