import { cn } from "@pachi/ui";
import { useLoaderData, useLocation } from "@remix-run/react";
import { noHeaderPaths, noSidebarPaths } from "~/constants";
import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";
import type { loader } from "~/root";

function Navbar(props: { children: React.ReactNode }) {
	const isScrolled = useIsWindowScrolled();
	const location = useLocation();
	const { sidebarIsOpen } = useLoaderData<typeof loader>();
	console.log("location", location.pathname);
	console.log("isScrolled", isScrolled);

	return (
		<header
			{...props}
			className={cn(
				"group hidden backdrop-blur-md fixed px-20 inset-x-0 top-0 z-30 left-1/2 transform -translate-x-1/2  md:flex items-center justify-between border border-mauve-6 py-2 transition-all duration-300 hover:border bg-component",
				noHeaderPaths(location.pathname) && "hidden md:hidden",
				sidebarIsOpen &&
					!noSidebarPaths.has(location.pathname) &&
					"md:ml-24 w-4/12",
				isScrolled || !noSidebarPaths.has(location.pathname)
					? "mt-4 h-14 w-11/12 rounded-lg px-6 dark:shadow-mauve-7 border md:h-14 md:w-8/12 lg:w-2/3 dark:slate-5 "
					: "h-16 w-full lg:px-40",
			)}
		/>
	);
}

export { Navbar };
