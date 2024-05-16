import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";

//@ts-ignore
import stylesheet from "./tailwind.css?url";

import { ClerkApp } from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import type { User } from "@pachi/validators/client";
import {
	PreventFlashOnWrongTheme,
	ThemeProvider,
	useTheme,
} from "remix-themes";
import { Header } from "./components/templates/layouts/header";
import Sidebar from "./components/templates/layouts/sidebar";
import { env } from "./env";
import { MarketplaceReplicacheProvider } from "./providers/replicache/marketplace";
import UserReplicacheProvider from "./providers/replicache/user";
import { prefs, themeSessionResolver } from "./sessions.server";
export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = (args) => {
	return rootAuthLoader(args, async ({ request }) => {
		const { getTheme } = await themeSessionResolver(request);
		const { getToken } = await getAuth(args);
		const cookieHeader = request.headers.get("Cookie");
		const cookie = (await prefs.parse(cookieHeader)) || {};
		const token = await getToken();
		const user = await fetch(`${env.WORKER_URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((res) => res.json() as Promise<User | undefined>);
		return {
			ENV: {
				REPLICACHE_KEY: env.REPLICACHE_KEY,
				WORKER_URL: env.WORKER_URL,
			},
			user,
			theme: getTheme(),
			sidebarIsOpen: cookie.sidebarIsOpen,
			headers: {
				"Set-Cookie": await prefs.serialize(cookie),
			},
		};
	});
};
function AppWithProviders() {
	const data = useLoaderData<typeof loader>();

	return (
		<ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
			<MarketplaceReplicacheProvider>
				<UserReplicacheProvider cartID={data.cartID}>
					<App />
				</UserReplicacheProvider>
			</MarketplaceReplicacheProvider>
		</ThemeProvider>
	);
}
export default ClerkApp(AppWithProviders);

export function App() {
	const data = useLoaderData<typeof loader>();
	const [theme] = useTheme();

	return (
		<html lang="en" className={theme === "dark" ? "dark" : ""}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
			</head>
			<body className="font-body">
				<Sidebar />
				<Header cartID={data.cartID} userID={data.user?.id} />
				<Outlet />
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
