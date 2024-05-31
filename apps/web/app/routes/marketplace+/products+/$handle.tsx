import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { userContext } from "~/sessions.server";
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import type { Product, Variant } from "@blazell/validators/client";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { ProductOverview } from "~/components/templates/product/product-overview";
type LoaderData = {
	product: Product | null;
	cartID: string | undefined;
};
export const loader: LoaderFunction = async (args) => {
	const handle = args.params.handle;
	if (!handle) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}
	const product = (await fetch(
		`${args.context.env.WORKER_URL}/products/${handle}`,
	).then((res) => res.json())) as Product | null;

	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};

	return json({
		product,
		cartID: userContextCookie.cartID,
	});
};

export default function Page() {
	const { product: serverProduct, cartID } = useLoaderData<LoaderData>();

	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	const product = ReplicacheStore.getByID<Product>(
		marketplaceRep,
		serverProduct?.id ?? "",
	);

	const variants = ReplicacheStore.scan<Variant>(
		marketplaceRep,
		`variant_${serverProduct?.id}`,
	);

	const [defaultVariant] = ReplicacheStore.scan<Variant>(
		marketplaceRep,
		`default_var_${serverProduct?.id}`,
	);

	const [searchParams, setSearchParams] = useSearchParams();
	const selectedVariantHandle = searchParams.get("variant") ?? undefined;
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const setSelectedVariantHandle = (handle: string | undefined) => {
		setSearchParams((prev) => {
			const params = new URLSearchParams(prev);
			if (!handle) {
				params.delete("variant");
				return params;
			}
			params.set("variant", handle);
			return params;
		});
	};

	const selectedVariant = selectedVariantHandle
		? variants.find((v) => v.handle === selectedVariantHandle) ?? null
		: null;
	return (
		<main className="flex justify-center relative">
			<ProductOverview
				product={product ?? serverProduct}
				variants={variants}
				selectedVariant={selectedVariant}
				setVariantIDOrHandle={setSelectedVariantHandle}
				selectedVariantIDOrHandle={selectedVariantHandle}
				cartID={cartID}
				defaultVariant={defaultVariant}
			/>
		</main>
	);
}
