import { Toaster } from "@pachi/ui/toaster";
import { json, type LinksFunction, type LoaderFunction } from "@remix-run/node";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import { HoneypotProvider } from "remix-utils/honeypot/react";
//@ts-ignore
import stylesheet from "./tailwind.css?url";

import { ClerkApp } from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import type { User } from "@pachi/validators/client";
import { GeneralErrorBoundary } from "./components/error-boundary";
import { Header } from "./components/templates/layouts/header";
import Sidebar from "./components/templates/layouts/sidebar";
import { env } from "./env";
import { ClientHintCheck, getHints } from "./hooks/use-hints";
import { useNonce } from "./hooks/use-nonce";
import { useTheme } from "./hooks/use-theme";
import { useUser } from "./hooks/use-user";
import { MarketplaceReplicacheProvider } from "./providers/replicache/marketplace";
import UserReplicacheProvider from "./providers/replicache/user";
import { prefs } from "./sessions.server";
import { getDomainUrl } from "./utils/helpers";
import { honeypot } from "./utils/honeypot.server";
import type { Theme } from "@pachi/validators";
export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		//TODO: ADD ICON
		{ rel: "stylesheet", href: stylesheet },
	].filter(Boolean);
};

export const loader: LoaderFunction = (args) => {
	return rootAuthLoader(args, async ({ request }) => {
		const cookieHeader = request.headers.get("Cookie");
		const cookie = (await prefs.parse(cookieHeader)) || {};
		const { getToken, userId } = await getAuth(args);
		const token = await getToken();
		const user = await fetch(`${env.WORKER_URL}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((res) => res.json() as Promise<User | undefined>);
		const honeyProps = honeypot.getInputProps();
		return json({
			ENV: {
				REPLICACHE_KEY: env.REPLICACHE_KEY,
				WORKER_URL: env.WORKER_URL,
				PARTYKIT_HOST: env.PARTYKIT_HOST,
			},
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: cookie.theme,
					sidebarState: cookie.sidebarState,
				},
			},
			user,
			authID: userId,
			honeyProps,
		});
	});
};
function App() {
	const data = useLoaderData<typeof loader>();
	const nonce = useNonce();
	const user = useUser();
	const theme = useTheme();
	return (
		<Document nonce={nonce} env={data.ENV} theme={theme}>
			<HoneypotProvider {...data.honeyProps}>
				<MarketplaceReplicacheProvider>
					<UserReplicacheProvider cartID={data.cartID}>
						<Sidebar />
						<Header cartID={data.cartID} authID={data.authID} user={user} />
						<Outlet />
						<Toaster />
					</UserReplicacheProvider>
				</MarketplaceReplicacheProvider>
			</HoneypotProvider>
		</Document>
	);
}

export default ClerkApp(App);

function Document({
	children,
	nonce,
	theme = "light",
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode;
	nonce: string;
	theme?: Theme;
	env?: Record<string, string>;
	allowIndexing?: boolean;
}) {
	return (
		<html lang="en" className={`${theme}`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Meta />
				<Links />
			</head>
			<body className="font-body dark:bg-mauve-1 bg-mauve-a-2">
				{children}
				<ScrollRestoration nonce={nonce} />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<Scripts nonce={nonce} />
			</body>
		</html>
	);
}
export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce();

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	);
}
