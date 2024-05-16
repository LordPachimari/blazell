"use client";

import { Button } from "@pachi/ui/button";
import { Icons, strokeWidth } from "@pachi/ui/icons";
import { Theme, useTheme } from "remix-themes";

export function ThemeToggle() {
	const [theme, setTheme] = useTheme();

	const toggleTheme = () => {
		setTheme((prevTheme) =>
			prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
		);
	};
	return (
		<Button variant={"ghost"} type="button" size={"icon"} onClick={toggleTheme}>
			<Icons.sun
				className="h-5 w-5 rotate-0 scale-100 text-mauve-11 transition-all dark:-rotate-90 dark:scale-0"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			/>
			<Icons.moon
				className="absolute h-5 w-5 rotate-90 text-mauve-11 scale-0 transition-all  dark:rotate-0 dark:scale-100"
				aria-hidden="true"
				strokeWidth={strokeWidth}
			/>
			<span className="sr-only ">Toggle theme</span>
		</Button>
	);
}
