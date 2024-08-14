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
				border: "var(--border)",
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
				red: {
					1: "var(--red-1)",
					2: "var(--red-2)",
					3: "var(--red-3)",
					4: "var(--red-4)",
					5: "var(--red-5)",
					6: "var(--red-6)",
					7: "var(--red-7)",
					8: "var(--red-8)",
					9: "var(--red-9)",
					10: "var(--red-10)",
					11: "var(--red-11)",
					12: "var(--red-12)",
				},

				brand: {
					1: "var(--brand-1)",
					2: "var(--brand-2)",
					3: "var(--brand-3)",
					4: "var(--brand-4)",
					5: "var(--brand-5)",
					6: "var(--brand-6)",
					7: "var(--brand-7)",
					8: "var(--brand-8)",
					9: "var(--brand-9)",
					10: "var(--brand-10)",
					11: "var(--brand-11)",
					12: "var(--brand-12)",
				},
				jade: {
					1: "var(--jade-1)",
					2: "var(--jade-2)",
					3: "var(--jade-3)",
					4: "var(--jade-4)",
					5: "var(--jade-5)",
					6: "var(--jade-6)",
					7: "var(--jade-7)",
					8: "var(--jade-8)",
					9: "var(--jade-9)",
					10: "var(--jade-10)",
					11: "var(--jade-11)",
					12: "var(--jade-12)",
				},
				slate: {
					1: "var(--slate-1)",
					2: "var(--slate-2)",
					3: "var(--slate-3)",
					4: "var(--slate-4)",
					5: "var(--slate-5)",
					6: "var(--slate-6)",
					7: "var(--slate-7)",
					8: "var(--slate-8)",
					9: "var(--slate-9)",
					10: "var(--slate-10)",
					11: "var(--slate-11)",
					12: "var(--slate-12)",
				},
				"slate-a": {
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
				yellow: {
					1: "var(--yellow-1)",
					2: "var(--yellow-2)",
					3: "var(--yellow-3)",
					4: "var(--yellow-4)",
					5: "var(--yellow-5)",
					6: "var(--yellow-6)",
					7: "var(--yellow-7)",
					8: "var(--yellow-8)",
					9: "var(--yellow-9)",
					10: "var(--yellow-10)",
					11: "var(--yellow-11)",
					12: "var(--yellow-12)",
				},
				iris: {
					1: "var(--iris-1)",
					2: "var(--iris-2)",
					3: "var(--iris-3)",
					4: "var(--iris-4)",
					5: "var(--iris-5)",
					6: "var(--iris-6)",
					7: "var(--iris-7)",
					8: "var(--iris-8)",
					9: "var(--iris-9)",
					10: "var(--iris-10)",
					11: "var(--iris-11)",
					12: "var(--iris-12)",
				},
				"black-a": {
					1: "var(--black-a1)",
					2: "var(--black-a2)",
					3: "var(--black-a3)",
					4: "var(--black-a4)",
					5: "var(--black-a5)",
					6: "var(--black-a6)",
					7: "var(--black-a7)",
					8: "var(--black-a8)",
					9: "var(--black-a9)",
					10: "var(--black-a10)",
					11: "var(--black-a11)",
					12: "var(--black-a12)",
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
				"shine-pulse": {
					"0%": {
						"background-position": "0% 0%",
					},
					"50%": {
						"background-position": "100% 100%",
					},
					to: {
						"background-position": "0% 0%",
					},
				},
				shake: {
					"0%": { transform: "translateX(0)" },
					"25%": { transform: "translateX(5px)" },
					"50%": { transform: "translateX(-5px)" },
					"75%": { transform: "translateX(5px)" },
					"100%": { transform: "translateX(0)" },
				},
				"notification-shake": {
					"0%": { transform: "translateX(0)" },
					"25%": { transform: "translateX(3px)" },
					"50%": { transform: "translateX(-3px)" },
					"75%": { transform: "translateX(3px)" },
					"100%": { transform: "translateX(0)" },
				},

				"fade-up": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)",
					},
					"75%": {
						opacity: "0.6",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				orbit: {
					"0%": {
						transform:
							"rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
					},
					"100%": {
						transform:
							"rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
					},
				},
				"caret-blink": {
					"0%,70%,100%": { opacity: "1" },
					"20%,50%": { opacity: "0" },
				},
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"caret-blink": "caret-blink 1.25s ease-out infinite",
				fadeIn: "fadeIn .3s ease-in-out",
				blink: "blink 1.4s both infinite",
				ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
				shake: "shake 0.5s linear infinite",
				"notification-shake": "notification-shake 0.5s linear infinite",
				slidein: "slidein 1s ease 300ms",
				"fade-up": "fade-up 0.5s ease-out",
				orbit: "orbit calc(var(--duration)*1s) linear infinite",
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
