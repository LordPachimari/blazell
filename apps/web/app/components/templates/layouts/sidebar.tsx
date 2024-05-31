import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import { useOptimisticSidebarMode } from "~/hooks/use-sidebar";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action.set-sidebar";
import { ThemeToggle } from "./theme-toggle";
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
		icon: "dashboard",
		items: [],
	},
	{
		title: "Marketplace",
		href: "/marketplace",
		icon: "marketplace",
		items: [],
	},
	{
		title: "Auctions",
		href: "/auction",
		icon: "billing",
		items: [],
	},
	{
		title: "Settings",
		href: "/settings",
		icon: "settings",
		items: [],
	},
];

const noSidebarPaths = new Set(["/", "/sign-in", "/sign-up", "/create-user"]);
const Sidebar = () => {
	const fetcher = useFetcher<typeof action>();
	const userPreference = useUserPreferences();
	const optimisticMode = useOptimisticSidebarMode();

	const mode = optimisticMode ?? userPreference.sidebarState ?? "closed";
	const nextMode = mode === "open" ? "closed" : "open";
	useHotkeys(["s"], () => {
		fetcher.submit(
			{ sidebarState: nextMode },
			{ method: "post", action: "/action/set-sidebar", navigate: false },
		);
	});
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	return (
		<div className="flex">
			<Button
				variant="ghost"
				size="icon"
				className="fixed lg:hidden bottom-4 left-3 z-50"
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
				{mode === "open" ? (
					<Icons.left size={20} strokeWidth={strokeWidth} />
				) : (
					<Icons.menu size={20} strokeWidth={strokeWidth} />
				)}
			</Button>
			<nav
				className={cn(
					"left-[-100px] lg:left-0 group ml-[3px] my-[3px] h-[calc(100%-6px)] rounded-xl bg-component justify-between lg:flex flex-col fixed z-40 w-14  overflow-hidden border border-mauve-7  backdrop-blur-md transition-all duration-200 ease-in-out lg:hover:w-44 ",
					{
						"lg:w-44 left-0": mode === "open",
						hidden: noSidebarPaths.has(location.pathname),
					},
				)}
			>
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
						className="hidden lg:block text-mauve-11 text-lg rounded-full"
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
									"group/link flex h-10 w-full items-center gap-3 rounded-md px-2 cursor-pointer hover:bg-mauve-a-2 ",
								)}
								prefetch="viewport"
								unstable_viewTransition
							>
								<div className="flex justify-center ">
									<Icon
										className={cn(
											`/${mainPath}` === item.href
												? "text-crimson-9"
												: "text-mauve-11 group-hover/link:text-crimson-9",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</div>
								<span
									className={cn(
										"w-[350px] text-mauve-11 font-light opacity-0 group-hover/link:text-crimson-9 transition-opacity duration-300 ease-in-out group-hover:opacity-100",

										`/${mainPath}` === item.href && "text-crimson-9",
										mode === "open" ? "lg:opacity-100" : "opacity-0",
									)}
								>
									{item.title}
								</span>
							</Link>
						);
					})}
				</ul>
				<div
					className={cn(
						"w-full flex justify-center mb-6 pt-2 group-hover:justify-end group-hover:pr-2",
						{
							"justify-end pr-2": mode === "open",
						},
					)}
				>
					<ThemeToggle />
				</div>
			</nav>
		</div>
	);
};

export default Sidebar;
