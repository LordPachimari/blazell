import type { Config } from "tailwindcss";
import baseConfig from "@pachi/tailwind-config/web";

export default {
	content: ["./app/**/*.{ts,tsx}", "../../packages/ui/**/*.{ts,tsx}"],
	presets: [baseConfig],
	theme: {
		extend: {
			fontFamily: {
				display: ["Freeman", "sans-serif"],
				body: ["Roboto", "sans-serif"],
			},
		},
	},
} satisfies Config;
