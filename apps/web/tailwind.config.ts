import type { Config } from "tailwindcss";

import baseConfig from "@pachi/tailwind-config/web";

export default {
	content: ["./app/**/*.{ts,tsx}"],
	presets: [baseConfig],
	theme: {
		extend: {
			fontFamily: {
				display: ["Freeman", "sans-serif"],
				body: ["Freeman", "sans-serif"],
			},
		},
	},
} satisfies Config;
