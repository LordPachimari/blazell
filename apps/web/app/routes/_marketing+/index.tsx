import { getAuth } from "@clerk/remix/ssr.server";
import {
	json,
	redirect,
	type LoaderFunction,
	type MetaFunction,
} from "@remix-run/cloudflare";
import { Features } from "~/components/templates/landing/features";
import { Hero } from "~/components/templates/landing/hero";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};
export const loader: LoaderFunction = async (args) => {
	const { userId } = await getAuth(args);
	if (userId) return redirect("/marketplace");
	return json({});
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
