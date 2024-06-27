import type { Product } from "@blazell/validators/client";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { useRequestInfo } from "~/hooks/use-request-info";
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

	return json(
		{
			product,
		},
		{ headers: { "Cache-Control": "public, max-age=3600" } },
	);
};

export default function Page() {
	const { product: serverProduct } = useLoaderData<LoaderData>();
	const { userContext } = useRequestInfo();
	const cartID = userContext.cartID;
	const navigate = useNavigate();
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);

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
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" || event.key === "Esc") {
				// Handle Escape key press here
				navigate("/marketplace", {
					preventScrollReset: true,
					unstable_viewTransition: true,
					replace: true,
				});
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [navigate]);

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);

	return (
		<div
			className="fixed inset-0 z-40 w-screen h-screen max-h-screen bg-black/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-y-scroll"
			onClick={() => {
				navigate("/marketplace", {
					preventScrollReset: true,
					unstable_viewTransition: true,
					replace: true,
				});
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					navigate("/marketplace", {
						preventScrollReset: true,
						unstable_viewTransition: true,
						replace: true,
					});
				}
			}}
		>
			<main className="flex w-full justify-center relative">
				{isInitialized && !product ? (
					<h1 className="font-freeman text-3xl mt-80 text-white dark:text-black">
						Product does not exist or has been deleted.
					</h1>
				) : (
					<ProductOverview
						product={product ?? serverProduct}
						variants={variants}
						selectedVariant={selectedVariant}
						setVariantIDOrHandle={setSelectedVariantHandle}
						selectedVariantIDOrHandle={selectedVariantHandle}
						cartID={cartID}
						defaultVariant={defaultVariant ?? serverProduct.defaultVariant}
					/>
				)}
			</main>
		</div>
	);
}
