import type { Store as StoreType } from "@blazell/validators/client";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Effect } from "effect";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { Store } from "~/components/templates/store/store";
import { useMarketplaceStore } from "~/zustand/store";
type LoaderData = {
	store: StoreType;
	cartID: string | undefined;
};
export const loader: LoaderFunction = async (args) => {
	const name = args.params.name;
	const { request } = args;
	const url = new URL(request.url);
	const origin = url.origin;
	if (!name) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const store = (await Effect.runPromise(
		HttpClientRequest.get(`${origin}/api/stores/${name}`).pipe(
			HttpClient.fetchOk,
			HttpClientResponse.json,
			Effect.scoped,
			Effect.catchAll((error) => Effect.fail(error)),
		),
	)) as StoreType | null;
	if (!store) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	return json(
		{
			store,
		},
		{ headers: { "Cache-Control": "public, max-age=31536000" } },
	);
};

export default function StorePage() {
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	const { store: serverStore } = useLoaderData<LoaderData>();
	const storeMap = useMarketplaceStore((state) => state.storeMap);
	const store = storeMap.get(serverStore.id);
	const products = useMarketplaceStore((state) =>
		state.products.filter((product) => product.storeID === serverStore.id),
	);
	const variantMap = useMarketplaceStore((state) => state.variantMap);

	return (
		<SidebarLayoutWrapper>
			<div className="p-4 pt-20">
				<Store
					isInitialized={isInitialized}
					products={products ?? serverStore.products}
					store={store ?? serverStore}
					variantMap={variantMap}
				/>
			</div>
		</SidebarLayoutWrapper>
	);
}
