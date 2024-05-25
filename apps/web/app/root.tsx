import { Toaster } from "@blazell/ui/toaster";
import {
	json,
	type LinksFunction,
	type LoaderFunction,
	type TypedResponse,
} from "@remix-run/cloudflare";
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
import { ClientOnly } from "remix-utils/client-only";
import { ClerkApp } from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import type { User } from "@blazell/validators/client";
import { GeneralErrorBoundary } from "./components/error-boundary";
import { Header } from "./components/templates/layouts/header";
import Sidebar from "./components/templates/layouts/sidebar";
import { ClientHintCheck, getHints } from "./hooks/use-hints";
import { useNonce } from "./hooks/use-nonce";
import { useTheme } from "./hooks/use-theme";
import { useUser } from "./hooks/use-user";
import { MarketplaceReplicacheProvider } from "./providers/replicache/marketplace";
import UserReplicacheProvider from "./providers/replicache/user";
import { prefs, userContext } from "./sessions.server";
import { getDomainUrl } from "./utils/helpers";
import type { Theme } from "@blazell/validators";
//@ts-ignore
import sonnerStyles from "./sonner.css?url";
import type { Env } from "load-context";
import { DashboardReplicacheProvider } from "./providers/replicache/dashboard";
import { PartykitProvider } from "./routes/partykit.client";
export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		//TODO: ADD ICON
		{ rel: "stylesheet", href: stylesheet },
		...(process.env.NODE_ENV === "development"
			? [{ rel: "stylesheet", href: sonnerStyles }]
			: []),
	].filter(Boolean);
};
export type RootLoaderData = {
	ENV: Omit<
		Env,
		"CLERK_PUBLISHABLE_KEY" | "CLERK_SECRET_KEY" | "SESSION_SECRET"
	>;
	requestInfo: {
		hints: ReturnType<typeof getHints>;
		origin: string;
		path: string;
		userPrefs: {
			theme?: Theme;
			sidebarState?: string;
		};
	};
	user?: User;
	authID: string | null;
	cartID?: string;
};

export const loader: LoaderFunction = (args) => {
	return rootAuthLoader(
		args,
		async ({ request, context }): Promise<TypedResponse<RootLoaderData>> => {
			const cookieHeader = request.headers.get("Cookie");
			const prefsCookie = (await prefs.parse(cookieHeader)) || {};
			const userContextCookie = (await userContext.parse(cookieHeader)) || {};
			const { getToken, userId } = await getAuth(args);
			const token = await getToken();
			const user = await fetch(`${context.env.WORKER_URL}/users`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}).then((res) => res.json() as Promise<User | undefined>);
			return json({
				ENV: {
					REPLICACHE_KEY: context.env.REPLICACHE_KEY,
					WORKER_URL: context.env.WORKER_URL,
					PARTYKIT_HOST: context.env.PARTYKIT_HOST,
					TRANSFORMER_URL: context.env.TRANSFORMER_URL,
				},
				requestInfo: {
					hints: getHints(request),
					origin: getDomainUrl(request),
					path: new URL(request.url).pathname,
					userPrefs: {
						theme: prefsCookie.theme,
						sidebarState: prefsCookie.sidebarState,
					},
				},
				...(user && { user }),
				authID: userId,
				cartID: userContextCookie.cartID,
			});
		},
	);
};
function App() {
	const data = useLoaderData<RootLoaderData>();
	const nonce = useNonce();
	const user = useUser();
	const theme = useTheme();
	return (
		<Document nonce={nonce} env={data.ENV} theme={theme}>
			<MarketplaceReplicacheProvider>
				<UserReplicacheProvider cartID={data.cartID}>
					<DashboardReplicacheProvider>
						<Sidebar />
						<Header cartID={data.cartID} authID={data.authID} user={user} />
						<Outlet />
						<Toaster />
						<ClientOnly>
							{() => <PartykitProvider cartID={data.cartID} />}
						</ClientOnly>
					</DashboardReplicacheProvider>
				</UserReplicacheProvider>
			</MarketplaceReplicacheProvider>
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
