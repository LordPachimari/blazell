import { cn } from "@blazell/ui";
import { LoadingSpinner } from "@blazell/ui/loading";
import type { PublishedProduct } from "@blazell/validators/client";
import { Link } from "@remix-run/react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Price from "~/components/molecules/price";
import { useMarketplaceStore } from "~/zustand/store";

const Products = () => {
	const products = useMarketplaceStore((state) => state.products);
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	console.log("products", products);

	if (!isInitialized)
		return (
			<section className="flex flex-col gap-2">
				<div className="w-full h-screen flex justify-center">
					<LoadingSpinner />
				</div>
			</section>
		);
	return (
		<section className="flex flex-col gap-2">
			<div className="grid md:grid-cols-5 sm:grid-cols-4 gap-1 grid-cols-2 min-[350px]:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 grid-rows-12">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
};
export { Products };
const ProductCard = ({ product }: { product: PublishedProduct }) => {
	return (
		<Link
			to={`/marketplace/products/${product.defaultVariant.handle}`}
			prefetch="viewport"
			className={cn(
				"flex flex-col border lg:hover:scale-[103%] lg:transition-all lg:ease-in-out lg:duration-200 min-h-28 min-w-28 col-span-1 row-span-1 cursor-pointer border-border rounded-lg overflow-hidden aspect-square",
				{
					"col-span-2 row-span-2": (product.score ?? 0) > 1,
				},
			)}
			unstable_viewTransition={true}
			preventScrollReset={true}
		>
			<div className="relative w-full h-full">
				{product.defaultVariant.thumbnail ? (
					<Image
						className="w-full h-full object-cover"
						src={product.defaultVariant?.thumbnail?.url}
						alt=""
						fit="cover"
						quality={80}
					/>
				) : (
					<div className="w-full h-full bg-component flex items-center justify-center">
						<ImagePlaceholder />
					</div>
				)}
				<div className="absolute inset-0 flex flex-col justify-between p-2 bg-gradient-to-b from-transparent to-black/30">
					<span className="self-end bg-brand-3 text-brand-9 font-freeman text-sm md:text-base border border-brand-9 rounded-lg p-1">
						<Price
							className="text-xs md:text-sm font-freeman flex-none text-brand-9"
							amount={product.defaultVariant.prices[0]!.amount}
							currencyCode={product.defaultVariant.prices[0]!.currencyCode}
							currencyCodeClassName="hidden @[275px]/label:inline"
						/>
					</span>
					<div>
						<h1 className="font-freeman text-sm line-clamp-1 text-ellipsis overflow-hidden text-white">
							{product.defaultVariant.title}
						</h1>
						<p
							className={cn("text-xs text-gray-200 line-clamp-2 mt-1", {
								hidden: product.score ?? 0 < 1,
							})}
						>
							{product.defaultVariant.description ?? ""}
						</p>
					</div>
				</div>
			</div>
		</Link>
	);
};
