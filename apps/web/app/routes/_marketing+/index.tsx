// import { getAuth } from "@clerk/remix/ssr.server";
import { Badge } from "@blazell/ui/badge";
import { Icons } from "@blazell/ui/icons";
import { redirect, type LoaderFunction, json } from "@remix-run/cloudflare";
import type { MetaFunction } from "@remix-run/cloudflare";
import { Features } from "~/components/templates/landing/features";
import { Hero } from "~/components/templates/landing/hero";
import Footer from "~/components/templates/layouts/footer";

export const loader: LoaderFunction = async ({ context }) => {
	const { authUser } = context;
	if (authUser) return redirect("/marketplace");
	return json({});
};
export const meta: MetaFunction = () => {
	return [
		{ title: "Blazell" },
		{ name: "description", content: "Welcome to Blazell!" },
	];
};
export default function Index() {
	return (
		<main className="flex flex-col items-center">
			<div className="fixed -z-10 left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<div
				style={{ animationDelay: "0.10s", animationFillMode: "both" }}
				className="bg-component shadow border border-border px-2 hover:bg-slate-2 cursor-pointer animate-fade-up text-sm font-medium text-slate-11 flex justify-center items-center p-1 gap-2 rounded-lg h-8 absolute top-[10vh]"
			>
				<Badge className="bg-brand-5 h-6 border-brand-6 text-brand-9">
					Beta
				</Badge>
				Under development.
				<Icons.Right className="size-4" />
			</div>
			<Hero />
			<Features />
			<div className="h-40" />
			<Footer />
		</main>
	);
}
