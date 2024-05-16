import type { Config } from "tailwindcss";
import pluginForm from "@tailwindcss/forms";
import tailwindTypography from "@tailwindcss/typography";
import tailwindAnimate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
const plugins = [
	tailwindTypography,
	tailwindAnimate,

	pluginForm({ strategy: "class" }),

	plugin(({ matchUtilities, theme }) => {
		matchUtilities(
			{
				"animation-delay": (value) => {
					return {
						"animation-delay": value,
					};
				},
			},
			{
				values: theme("transitionDelay")!,
			},
		);
	}),
];

export default {
	darkMode: ["class"],

	content: ["./src/**/*.{js,ts,jsx,tsx}"],

	variants: {
		extends: {
			opacity: ["group-hover"],
			visibility: ["group-hover"],
			translate: ["group-hover"],
		},
	},
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},

		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "var(--ring)",
				background: "var(--background)",
				navbar: "var(--navbar)",
				component: "var(--component)",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				vice: {
					start: "#7C53FF",
					stop: "#F796FF",
				},
				ruby: {
					1: "var(--ruby-1)",
					2: "var(--ruby-2)",
					3: "var(--ruby-3)",
					4: "var(--ruby-4)",
					5: "var(--ruby-5)",
					6: "var(--ruby-6)",
					7: "var(--ruby-7)",
					8: "var(--ruby-8)",
					9: "var(--ruby-9)",
					10: "var(--ruby-10)",
					11: "var(--ruby-11)",
					12: "var(--ruby-12)",
				},
				"slate-alpha": {
					1: "var(--slate-a1)",
					2: "var(--slate-a2)",
					3: "var(--slate-a3)",
					4: "var(--slate-a4)",
					5: "var(--slate-a5)",
					6: "var(--slate-a6)",
					7: "var(--slate-a7)",
					8: "var(--slate-a8)",
					9: "var(--slate-a9)",
					10: "var(--slate-a10)",
					11: "var(--slate-a11)",
					12: "var(--slate-a12)",
				},
				crimson: {
					1: "var(--crimson-1)",
					2: "var(--crimson-2)",
					3: "var(--crimson-3)",
					4: "var(--crimson-4)",
					5: "var(--crimson-5)",
					6: "var(--crimson-6)",
					7: "var(--crimson-7)",
					8: "var(--crimson-8)",
					9: "var(--crimson-9)",
					10: "var(--crimson-10)",
					11: "var(--crimson-11)",
					12: "var(--crimson-12)",
				},
				mauve: {
					1: "var(--mauve-1)",
					2: "var(--mauve-2)",
					3: "var(--mauve-3)",
					4: "var(--mauve-4)",
					5: "var(--mauve-5)",
					6: "var(--mauve-6)",
					7: "var(--mauve-7)",
					8: "var(--mauve-8)",
					9: "var(--mauve-9)",
					10: "var(--mauve-10)",
					11: "var(--mauve-11)",
					12: "var(--mauve-12)",
				},
				"mauve-a": {
					1: "var(--mauve-a1)",
					2: "var(--mauve-a2)",
					3: "var(--mauve-a3)",
					4: "var(--mauve-a4)",
					5: "var(--mauve-a5)",
					6: "var(--mauve-a6)",
					7: "var(--mauve-a7)",
					8: "var(--mauve-a8)",
					9: "var(--mauve-a9)",
					10: "var(--mauve-a10)",
					11: "var(--mauve-a11)",
					12: "var(--mauve-a12)",
				},
			},
			gridAutoColumns: {
				"grid-cols-auto-fit": "repeat(auto-fit, minmax(200px, 1fr))",
			},

			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				fadeIn: "fadeIn .3s ease-in-out",
				blink: "blink 1.4s both infinite",
				ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
			},
			boxShadow: {
				border: "0px 0px 0px 1px #E5E7EB",
				"focus-border": "0px 0px 0px 1px #7C3AED",
				"error-border": "0px 0px 0px 1px #F43F5E",
				"input-shadow": "var(--input-shadow)",
			},
		},
	},
	plugins,
} satisfies Config;
