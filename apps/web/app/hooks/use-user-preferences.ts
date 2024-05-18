import type { Theme } from "@pachi/validators";
import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "~/root";
interface Preferences {
	theme: Theme;

	sidebarState: "open" | "closed";
}
export function useUserPreferences(): Preferences {
	const data = useRouteLoaderData<typeof rootLoader>("root");
	return data.requestInfo.userPrefs as Preferences;
}
