import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
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
import { ClientOnly } from "remix-utils/client-only";
import { useOptimisticThemeMode } from "~/hooks/use-theme";
import { useUserPreferences } from "~/hooks/use-user-preferences";
import type { action } from "~/routes/action+/set-theme";

export function ThemeToggle() {
	const fetcher = useFetcher<typeof action>();
	const userPreference = useUserPreferences();
	const optimisticMode = useOptimisticThemeMode();
	const mode = optimisticMode ?? userPreference.theme ?? "system";
	const modeLabel = {
		light: (
			<Icons.Sun
				className="h-5 w-5 rotate-0 scale-100 text-slate-11 group-hover:text-brand-9  transition-all dark:-rotate-90"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">Light</span>
			</Icons.Sun>
		),
		dark: (
			<Icons.Moon
				className="h-5 w-5 rotate-0 scale-100 text-slate-11 group-hover:text-brand-9  transition-all dark:-rotate-90"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">Dark</span>
			</Icons.Moon>
		),
		system: (
			<Icons.Laptop
				className="h-5 w-5 scale-100 text-slate-11 group-hover:text-brand-9  transition-all"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			>
				<span className="sr-only">System</span>
			</Icons.Laptop>
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
			},
		);
	}, []);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					buttonVariants({ size: "icon", variant: "outline" }),
					"rounded-lg",
				)}
			>
				<ClientOnly>{() => modeLabel[mode]}</ClientOnly>
				<span className="sr-only">Toggle theme</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center">
				<DropdownMenuItem
					className="flex gap-2 group"
					onClick={() => onClick("light")}
				>
					<ClientOnly>{() => modeLabel.light}</ClientOnly>
					<span>Light</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex gap-2 group"
					onClick={() => onClick("dark")}
				>
					<ClientOnly>{() => modeLabel.dark}</ClientOnly>
					<span>Dark</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex gap-2 group"
					onClick={() => onClick("system")}
				>
					<ClientOnly>{() => modeLabel.system}</ClientOnly>
					<span>System</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
