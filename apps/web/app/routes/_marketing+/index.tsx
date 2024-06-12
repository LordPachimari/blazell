// import { getAuth } from "@clerk/remix/ssr.server";
import { ShineBorder } from "@blazell/ui/shine-border";
import type { MetaFunction } from "@remix-run/cloudflare";
import { Features } from "~/components/templates/landing/features";
import { Hero } from "~/components/templates/landing/hero";
import Footer from "~/components/templates/layouts/footer";
import { useTheme } from "~/hooks/use-theme";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};
export default function Index() {
	const theme = useTheme();
	return (
		<main className="flex flex-col items-center">
			<ShineBorder
				className="text-center absolute top-20 text-xl font-bold capitalize"
				color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
			>
				<div>
					<h1 className="font-freeman">Under development</h1>
				</div>
			</ShineBorder>
			<Hero />
			<Features theme={theme} />
			<div className="h-40" />
			<Footer />
		</main>
	);
}
