import type { MetaFunction } from "@remix-run/node";
import { Features } from "~/components/templates/landing/features";
import { Hero } from "~/components/templates/landing/hero";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export default function Index() {
	return (
		<main>
			<Hero />
			<Features />
			<div className="h-40" />

			{/* <Footer /> */}
		</main>
	);
}
