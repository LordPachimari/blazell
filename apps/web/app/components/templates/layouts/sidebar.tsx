import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { Link, useFetcher, useLocation } from "@remix-run/react";
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

const noSidebarPaths = new Set(["/", "/sign-in", "/sign-up", "/create-user"]);

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
				navigate: false,
				fetcherKey: "sidebar-fetcher",
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
					"hidden group h-full dark:bg-mauve-1 justify-between lg:flex flex-col fixed z-40 w-14 overflow-hidden transition-all duration-200 ease-in-out hover:w-44 p-1",
					{
						"w-44": mode === "open",
						"bg-component dark:bg-component": mainPath === "dashboard",
						"hidden lg:hidden": noSidebarPaths.has(location.pathname),
					},
				)}
			>
				<div className="h-full w-full flex flex-col justify-between rounded-xl bg-component border border-mauve-5 dark:border-mauve-7   backdrop-blur-sm lg:backdrop-blur-md">
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
							className="text-mauve-11 text-lg rounded-full"
							type="submit"
							onClick={() =>
								fetcher.submit(
									{ sidebarState: nextMode },
									{
										method: "post",
										action: "/action/set-sidebar",
										navigate: false,
										fetcherKey: "sidebar-fetcher",
									},
								)
							}
						>
							s
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
										"group/link flex h-10 w-full items-center gap-3 rounded-2xl px-2 cursor-pointer hover:bg-mauve-a-2 ",
									)}
									prefetch="viewport"
								>
									<div className="flex justify-center ">
										<Icon
											className={cn(
												`/${mainPath}` === item.href
													? "text-brand-9"
													: "text-mauve-11 group-hover/link:text-brand-9",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</div>
									<span
										className={cn(
											"w-[350px] text-mauve-11 font-light opacity-0 group-hover/link:text-brand-9 transition-opacity duration-300 ease-in-out lg:group-hover:opacity-100",

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
					"fixed lg:hidden bottom-1 h-12 group ml-[3px] w-[calc(100%-6px)] rounded-xl bg-mauve-a-1 dark:bg-component justify-between flex flex-col z-40 overflow-hidden border border-mauve-5 dark:border-mauve-7 backdrop-blur-sm",
					{
						hidden: noSidebarPaths.has(location.pathname),
					},
				)}
			>
				<ul className="justify-between items-center flex w-full h-full gap-4 p-2">
					<Button
						variant="ghost"
						size="icon"
						className={cn(
							"bottom-4 bg-transparent border-none left-3 z-50 md:hidden",
							{
								hidden: mainPath !== "dashboard",
							},
						)}
						onClick={() => setOpened(!opened)}
					>
						{opened ? (
							<Icons.Left size={20} strokeWidth={strokeWidth} />
						) : (
							<Icons.Menu size={20} strokeWidth={strokeWidth} />
						)}
					</Button>
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];

						return (
							<Link
								to={item.href}
								key={item.title}
								className={cn("group/link")}
								prefetch="viewport"
							>
								<div className="flex justify-center  hover:bg-mauve-a-2 items-center rounded-full px-2 cursor-pointer ">
									<Icon
										className={cn(
											`/${mainPath}` === item.href
												? "text-brand-9"
												: "text-mauve-11 group-hover/link:text-brand-9",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</div>
							</Link>
						);
					})}

					<div className={cn("flex justify-center")}>
						{windowSize.width < 1024 && !noHeaderPaths(location.pathname) && (
							<GlobalSearchCombobox />
						)}
					</div>
				</ul>
			</nav>
		</div>
	);
};

export { MobileSidebar, Sidebar };
