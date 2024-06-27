// import { getAuth } from "@clerk/remix/ssr.server";
import { Badge } from "@blazell/ui/badge";
import { Icons } from "@blazell/ui/icons";
import type { MetaFunction } from "@remix-run/cloudflare";
import { Features } from "~/components/templates/landing/features";
import { Hero } from "~/components/templates/landing/hero";
import Footer from "~/components/templates/layouts/footer";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};
export default function Index() {
	return (
		<main className="flex flex-col items-center">
			<div className="absolute left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<div
				style={{ animationDelay: "0.10s", animationFillMode: "both" }}
				className="bg-component shadow border border-mauve-5 dark:border-mauve-7 px-2 hover:bg-mauve-2 cursor-pointer animate-fade-up text-sm font-medium text-mauve-11 flex justify-center items-center p-1 gap-2 rounded-2xl h-8 absolute top-[50px] lg:top-[200px]"
			>
				<Badge className="bg-brand-5 h-6 border-brand-6 text-brand-9">
					Beta
				</Badge>
				Introducing blazell
				<Icons.Right className="size-4" />
			</div>
			<Hero />
			<Features />
			<div className="h-40" />
			<Footer />
		</main>
	);
}
