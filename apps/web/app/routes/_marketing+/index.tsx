import type { Theme } from "@blazell/validators";
import { getAuth } from "@clerk/remix/ssr.server";
import {
	json,
	redirect,
	type LoaderFunction,
	type MetaFunction,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Features } from "~/components/templates/landing/features";
import { Hero } from "~/components/templates/landing/hero";
import { prefs } from "~/sessions.server";
import { ShineBorder } from "@blazell/ui/shine-border";
import Footer from "~/components/templates/layouts/footer";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};
interface LoaderData {
	theme: Theme;
}
export const loader: LoaderFunction = async (args) => {
	const { userId } = await getAuth(args);
	const cookieHeader = args.request.headers.get("Cookie");
	const prefsCookie = (await prefs.parse(cookieHeader)) || {};
	if (userId) return redirect("/marketplace");
	return json({ theme: prefsCookie.theme });
};

export default function Index() {
	const { theme } = useLoaderData<LoaderData>();
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
