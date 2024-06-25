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
import type { Theme } from "@blazell/validators";
import type { User } from "@blazell/validators/client";
import { ClerkApp } from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClientOnly } from "remix-utils/client-only";
import { GeneralErrorBoundary } from "./components/error-boundary";
import { Header } from "./components/templates/layouts/header";
import { MobileSidebar, Sidebar } from "./components/templates/layouts/sidebar";
import { ClientHintCheck, getHints } from "./hooks/use-hints";
import { useNonce } from "./hooks/use-nonce";
import { useTheme } from "./hooks/use-theme";
import { GlobalReplicacheProvider } from "./providers/replicache/global";
import { MarketplaceReplicacheProvider } from "./providers/replicache/marketplace";
import { prefs, userContext } from "./sessions.server";
import stylesheet from "./tailwind.css?url";
import { getDomainUrl } from "./utils/helpers";
import sonnerStyles from "./sonner.css?url";
import { AppEnvSchema, type AppEnv } from "load-context";
import { DashboardReplicacheProvider } from "./providers/replicache/dashboard";
import { PartykitProvider } from "./routes/partykit.client";
import vaulStyles from "./vaul.css?url";
import tiptap from "./tiptap.css?url";
import {
	GlobalSearchProvider,
	GlobalStoreProvider,
	MarketplaceStoreProvider,
} from "./zustand/store";
import {
	GlobalStoreMutator,
	MarketplaceStoreMutator,
} from "./zustand/store-mutator";
export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		//TODO: ADD ICON
		{ rel: "stylesheet", href: stylesheet },
		{ rel: "stylesheet", href: sonnerStyles },
		{ rel: "stylesheet", href: vaulStyles },
		{ rel: "stylesheet", href: tiptap },
	].filter(Boolean);
};
export type RootLoaderData = {
	ENV: Omit<AppEnv, "CLERK_PUBLISHABLE_KEY" | "CLERK_SECRET_KEY">;
	requestInfo: {
		hints: ReturnType<typeof getHints>;
		origin: string;
		path: string;
		userPrefs: {
			theme?: Theme;
			sidebarState?: string;
		};
		userContext: {
			user?: User;
			authID: string | null;
			cartID?: string;
			fakeAuthID?: string;
		};
	};
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
			const { userId } = await getAuth(args);
			// const token = await getToken();
			// const user = await fetch(`${WORKER_URL}/users`, {
			// 	method: "GET",
			// 	headers: {
			// 		Authorization: `Bearer ${token}`,
			// 	},
			// }).then((res) => res.json() as Promise<User | undefined>);
			const user = await fetch(
				`${WORKER_URL}/users/id/${userContextCookie.fakeAuthID}`,
				{
					method: "GET",
				},
			).then((res) => res.json() as Promise<User | undefined>);
			return json(
				{
					ENV: {
						REPLICACHE_KEY,
						WORKER_URL,
						PARTYKIT_HOST,
					},
					requestInfo: {
						hints: getHints(request),
						origin: getDomainUrl(request),
						path: new URL(request.url).pathname,
						userPrefs: {
							theme: prefsCookie.theme,
							sidebarState: prefsCookie.sidebarState,
						},
						userContext: {
							...(user && { user }),
							authID: userId,
							cartID: userContextCookie.cartID,
							fakeAuthID: userContextCookie.fakeAuthID,
						},
					},
				},
				// { headers: { "Cache-Control": "private, max-age=1800" } },
			);
		},
	);
};

function App() {
	const data = useLoaderData<RootLoaderData>();
	const nonce = useNonce();
	const theme = useTheme();

	return (
		<Document nonce={nonce} env={data.ENV} theme={theme}>
			<MarketplaceReplicacheProvider>
				<GlobalReplicacheProvider>
					<DashboardReplicacheProvider>
						<GlobalStoreProvider>
							<MarketplaceStoreProvider>
								<GlobalSearchProvider>
									<GlobalStoreMutator>
										<MarketplaceStoreMutator>
											<Sidebar />
											<MobileSidebar />
											<Header />
											<Outlet />
											<Toaster />
										</MarketplaceStoreMutator>
									</GlobalStoreMutator>
								</GlobalSearchProvider>
							</MarketplaceStoreProvider>
						</GlobalStoreProvider>
						<ClientOnly>{() => <PartykitProvider />}</ClientOnly>
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
			<body className="relative font-body bg-background min-w-[280px]">
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
