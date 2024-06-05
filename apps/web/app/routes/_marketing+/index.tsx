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
		<main>
			<Hero />
			<Features theme={theme} />
			<div className="h-40" />
			{/* <Footer /> */}
		</main>
	);
}
