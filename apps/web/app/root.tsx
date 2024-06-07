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
import { MobileSidebar, Sidebar } from "./components/templates/layouts/sidebar";
import { ClientHintCheck, getHints } from "./hooks/use-hints";
import { useNonce } from "./hooks/use-nonce";
import { useTheme } from "./hooks/use-theme";
import { useUser } from "./hooks/use-user";
import { MarketplaceReplicacheProvider } from "./providers/replicache/marketplace";
import { GlobalReplicacheProvider } from "./providers/replicache/global";
import { prefs, userContext } from "./sessions.server";
import { getDomainUrl } from "./utils/helpers";
import type { Theme } from "@blazell/validators";
//@ts-ignore
import sonnerStyles from "./sonner.css?url";
//@ts-ignore
import vaulStyles from "./vaul.css?url";
import { DashboardReplicacheProvider } from "./providers/replicache/dashboard";
import { PartykitProvider } from "./routes/partykit.client";
import { GlobalStoreProvider } from "./zustand/store";
import { GlobalStoreMutator } from "./zustand/store-mutator";
import { AppEnvSchema, type AppEnv } from "load-context";
export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		//TODO: ADD ICON
		{ rel: "stylesheet", href: stylesheet },
		...(process.env.NODE_ENV === "development"
			? [
					{ rel: "stylesheet", href: sonnerStyles },
					{ rel: "stylesheet", href: vaulStyles },
				]
			: []),
	].filter(Boolean);
};
export type RootLoaderData = {
	ENV: Omit<
		AppEnv,
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
	fakeAuthID?: string;
};

export const loader: LoaderFunction = (args) => {
	return rootAuthLoader(
		args,
		async ({ request, context }): Promise<TypedResponse<RootLoaderData>> => {
			const { PARTYKIT_HOST, REPLICACHE_KEY, WORKER_URL } = AppEnvSchema.parse(
				context.cloudflare.env,
			);
			const cookieHeader = request.headers.get("Cookie");
			const prefsCookie = (await prefs.parse(cookieHeader)) || {};
			const userContextCookie = (await userContext.parse(cookieHeader)) || {};
			const { getToken, userId } = await getAuth(args);
			const token = await getToken();
			const user = await fetch(`${WORKER_URL}/users`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}).then((res) => res.json() as Promise<User | undefined>);
			return json(
				{
					ENV: {
						REPLICACHE_KEY: REPLICACHE_KEY,
						WORKER_URL: WORKER_URL,
						PARTYKIT_HOST: PARTYKIT_HOST,
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
					fakeAuthID: userContextCookie.fakeAuthID,
				},
				// { headers: { "Cache-Control": "private, max-age=1800" } },
			);
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
				<GlobalReplicacheProvider
					cartID={data.cartID}
					{...(data.fakeAuthID && { fakeAuthID: data.fakeAuthID })}
				>
					<DashboardReplicacheProvider
						{...(data.fakeAuthID && { fakeAuthID: data.fakeAuthID })}
					>
						<GlobalStoreProvider>
							<GlobalStoreMutator>
								<Sidebar />
								{/* <MobileSidebar /> */}
								<Header
									cartID={data.cartID ?? null}
									authID={data.authID}
									user={user}
									{...(data.fakeAuthID && { fakeAuthID: data.fakeAuthID })}
								/>
								<Outlet />
								<Toaster />
							</GlobalStoreMutator>
						</GlobalStoreProvider>
						<ClientOnly>
							{() => (
								<PartykitProvider
									cartID={data.cartID}
									{...(data.fakeAuthID && { fakeAuthID: data.fakeAuthID })}
								/>
							)}
						</ClientOnly>
					</DashboardReplicacheProvider>
				</GlobalReplicacheProvider>
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
			<body className="font-body dark:bg-mauve-1 bg-mauve-a-2 min-w-[280px]">
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
