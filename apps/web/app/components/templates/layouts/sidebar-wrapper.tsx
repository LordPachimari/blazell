import { cn } from "@blazell/ui";
import { useLocation } from "@remix-run/react";
import { noSidebarPaths } from "~/constants";
import { useOptimisticSidebarMode } from "~/hooks/use-sidebar";
import { useUserPreferences } from "~/hooks/use-user-preferences";

export function SidebarLayoutWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const location = useLocation();
	const userPreference = useUserPreferences();
	const optimisticMode = useOptimisticSidebarMode();
	const mode = optimisticMode ?? userPreference.sidebarState ?? "closed";

	return (
		<div
			className={cn("min-w-full transition-all duration-200 ease-in-out", {
				"lg:pl-[56px]": !noSidebarPaths.has(location.pathname),
				"lg:pl-[176px]":
					!noSidebarPaths.has(location.pathname) && mode === "open",
			})}
		>
			{children}
		</div>
	);
}
