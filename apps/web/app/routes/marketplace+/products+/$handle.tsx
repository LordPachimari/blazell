import type { Product } from "@blazell/validators/client";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { userContext } from "~/sessions.server";
import { useMarketplaceStore } from "~/zustand/store";
type LoaderData = {
	product: Product;
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
		`${args.context.cloudflare.env.WORKER_URL}/products/${handle}`,
	).then((res) => res.json())) as Product | null;
	if (!product) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};

	return json({
		product,
		cartID: userContextCookie.cartID,
	});
};

export default function Page() {
	const { product: serverProduct, cartID } = useLoaderData<LoaderData>();
	const productMap = useMarketplaceStore((state) => state.productMap);
	const variantMap = useMarketplaceStore((state) => state.variantMap);
	const product = productMap.get(serverProduct.id);
	const variants = useMarketplaceStore((state) =>
		state.variants.filter(
			(v) =>
				v.productID === serverProduct.id &&
				v.id !== serverProduct.defaultVariantID,
		),
	);
	const defaultVariant = variantMap.get(serverProduct.defaultVariantID);

	const [searchParams, setSearchParams] = useSearchParams();
	const selectedVariantHandle = searchParams.get("variant") ?? undefined;
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const setSelectedVariantHandle = (handle: string | undefined) => {
		setSearchParams(
			(prev) => {
				const params = new URLSearchParams(prev);
				if (!handle) {
					params.delete("variant");
					return params;
				}
				params.set("variant", handle);
				return params;
			},
			{ preventScrollReset: true },
		);
	};

	const selectedVariant = selectedVariantHandle
		? variants.find((v) => v.handle === selectedVariantHandle)
		: undefined;
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
