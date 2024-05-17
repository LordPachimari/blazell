import { useHotkeys } from "react-hotkeys-hook";
import { Icons, strokeWidth } from "@pachi/ui/icons";
import { Link, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import { cn } from "@pachi/ui";
import { Button } from "@pachi/ui/button";
import { ThemeToggle } from "./theme-toggle";
import type { loader } from "~/root";
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
	const fetcher = useFetcher();
	const { sidebarIsOpen } = useLoaderData<typeof loader>();
	useHotkeys(["s"], () => {
		fetcher.submit(
			{ sidebarIsOpen: sidebarIsOpen ? "closed" : "open" },
			{ method: "post", action: "/action/set-sidebar" },
		);
	});
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	return (
		<div className="flex">
			<nav
				className={cn(
					"group m-1 rounded-xl bg-component justify-between flex h-screen flex-col fixed z-40 w-14  overflow-hidden border border-mauve-6  backdrop-blur-md transition-all duration-200 ease-in-out hover:w-44 ",
					{
						"w-44": sidebarIsOpen,
						hidden: noSidebarPaths.has(location.pathname),
					},
				)}
			>
				<div
					className={cn(
						"w-full flex justify-center pt-2 group-hover:justify-end group-hover:pr-2",
						{
							"justify-end pr-2": sidebarIsOpen,
						},
					)}
				>
					<fetcher.Form method="post" action="/action/set-sidebar">
						<Button
							size={"icon"}
							variant={"ghost"}
							className="text-mauve-11 text-lg"
						>
							s
						</Button>
					</fetcher.Form>
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
										sidebarIsOpen ? "opacity-100" : "opacity-0",
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
							"justify-end pr-2": sidebarIsOpen,
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
