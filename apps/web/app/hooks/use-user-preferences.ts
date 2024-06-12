import type { Theme } from "@blazell/validators";
import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
interface Preferences {
	theme: Theme;

	sidebarState: "open" | "closed";
}
export function useUserPreferences(): Preferences {
	const data = useRouteLoaderData<RootLoaderData>("root");
	return data?.requestInfo.userPrefs as Preferences;
}
