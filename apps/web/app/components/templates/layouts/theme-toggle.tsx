import { Button } from "@pachi/ui/button";
import { Icons, strokeWidth } from "@pachi/ui/icons";
import { useFetcher } from "@remix-run/react";
import { useOptimisticThemeMode } from "~/hooks/use-theme";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action.set-theme";

export function ThemeToggle() {
	const fetcher = useFetcher<typeof action>();
	const userPreference = useUserPreferences();
	const optimisticMode = useOptimisticThemeMode();
	const mode = optimisticMode ?? userPreference.theme ?? "system";
	const nextMode =
		mode === "system" ? "light" : mode === "light" ? "dark" : "system";
	const modeLabel = {
		light: (
			<Icons.sun
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11 transition-all dark:-rotate-90 dark:scale-0"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">Light</span>
			</Icons.sun>
		),
		dark: (
			<Icons.moon
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11 transition-all dark:-rotate-90"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">Dark</span>
			</Icons.moon>
		),
		system: (
			<Icons.laptop
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11 transition-all dark:-rotate-90 dark:scale-0"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">System</span>
			</Icons.laptop>
		),
	};
	return (
		<Button
			variant={"ghost"}
			size={"icon"}
			onClick={() =>
				fetcher.submit(
					{
						theme: nextMode,
					},
					{
						method: "POST",
						action: "/action/set-theme",
						navigate: false,
						fetcherKey: "theme-fetcher",
					},
				)
			}
		>
			{modeLabel[mode]}
		</Button>
	);
}
