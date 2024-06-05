import { Button } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import type { Theme } from "@blazell/validators";
import { useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { useOptimisticThemeMode } from "~/hooks/use-theme";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action.set-theme";

export function ThemeToggle() {
	const fetcher = useFetcher<typeof action>();
	const userPreference = useUserPreferences();
	const optimisticMode = useOptimisticThemeMode();
	const mode = optimisticMode ?? userPreference.theme ?? "system";
	const modeLabel = {
		light: (
			<Icons.sun
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11  transition-all dark:-rotate-90"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">Light</span>
			</Icons.sun>
		),
		dark: (
			<Icons.moon
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11  transition-all dark:-rotate-90"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">Dark</span>
			</Icons.moon>
		),
		system: (
			<Icons.laptop
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11  transition-all dark:-rotate-90"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">System</span>
			</Icons.laptop>
		),
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onClick = useCallback((theme: Theme) => {
		return fetcher.submit(
			{
				theme,
			},
			{
				method: "POST",
				action: "/action/set-theme",
				navigate: false,
				fetcherKey: "theme-fetcher",
			},
		);
	}, []);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					{modeLabel[mode]}
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					className="flex gap-2"
					onClick={() => onClick("light")}
				>
					{modeLabel.light}
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex gap-2"
					onClick={() => onClick("dark")}
				>
					{modeLabel.dark}
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex gap-2"
					onClick={() => onClick("system")}
				>
					{modeLabel.system}
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
