import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

//@ts-ignore
import stylesheet from "./tailwind.css?url";

import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { env } from "./env";
import { ThemeProvider } from "./utils/theme-provider";
import { MarketplaceReplicacheProvider } from "src/providers/replicache/marketplace";
import UserReplicacheProvider from "src/providers/replicache/user";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = (args) => {
	return rootAuthLoader(args, async ({ request }) => {
		const { getToken } = await getAuth(args);
		const token = await getToken();
		const user = await fetch(`${env.WORKER_URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((res) => res.json());
		return {
			ENV: {
				REPLICACHE_KEY: env.REPLICACHE_KEY,
				WORKER_URL: env.WORKER_URL,
				user,
			},
		};
	});
};
export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>();

	return (
		<ThemeProvider specifiedTheme={data.theme}>
			<MarketplaceReplicacheProvider>
				<UserReplicacheProvider cartID={cartID}>
					<Sidebar />
					<Header cartID={cartID} />

					<Outlet />
				</UserReplicacheProvider>
			</MarketplaceReplicacheProvider>
		</ThemeProvider>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const data = useLoaderData<typeof loader>();
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="font-body">
				<ScrollRestoration />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
					}}
				/>
				<Scripts />
			</body>
		</html>
	);
}
