import { cn } from "@blazell/ui";
import { useLoaderData, useLocation } from "@remix-run/react";
import { noHeaderPaths, noSidebarPaths } from "~/constants";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import type { RootLoaderData } from "~/root";

function Navbar(props: { children: React.ReactNode }) {
	const isScrolled = useIsWindowScrolled();
	const location = useLocation();
	const { requestInfo } = useLoaderData<RootLoaderData>();
	return (
		<header
			{...props}
			className={cn(
				"group bg-transparent border-b backdrop-blur-sm lg:backdrop-blur-md fixed px-20 inset-x-0 top-0 z-10 left-1/2 transform -translate-x-1/2  lg:flex items-center justify-between lg:border lg:border-mauve-7 py-2 transition-all duration-300 hover:border lg:bg-component",
				noHeaderPaths(location.pathname) && "hidden lg:hidden",
				requestInfo.userPrefs.sidebarState === "open" &&
					!noSidebarPaths.has(location.pathname) &&
					isScrolled &&
					"md:ml-[88px] w-4/12",
				isScrolled
					? "mt-4 h-14 w-11/12 rounded-2xl px-6 dark:shadow-mauve-7 border md:h-14 md:w-8/12 lg:w-2/3 "
					: "h-16 w-full lg:px-40",
			)}
		/>
	);
}

export { Navbar };
