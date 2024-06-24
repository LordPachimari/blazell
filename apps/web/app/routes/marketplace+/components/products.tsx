import { cn } from "@blazell/ui";
import { Skeleton } from "@blazell/ui/skeleton";
import type { PublishedProduct } from "@blazell/validators/client";
import { Link } from "@remix-run/react";
import type { Replicache } from "replicache";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Price from "~/components/molecules/price";
import { useMarketplaceStore } from "~/zustand/store";

interface ProductsProps {
	marketplaceRep: Replicache | null;
	category: string;
}

const Products = ({ marketplaceRep }: ProductsProps) => {
	const products = useMarketplaceStore((state) => state.products);
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);

	if (!isInitialized)
		return (
			<section className="flex flex-col w-full gap-2">
				<div className="w-full h-screen grid md:grid-cols-5 sm:grid-cols-4 gap-1 grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 grid-rows-12">
					{Array.from({ length: 24 }).map((_, i) => (
						<Skeleton
							key={i}
							className={cn(
								"border border-mauve-5 dark:border-mauve-7   row-span-1 h-auto col-span-1",
								{
									"row-span-2 col-span-2": i === 3 || i === 10,
								},
							)}
						/>
					))}
				</div>
			</section>
		);
	return (
		<section className="flex flex-col gap-2">
			<div className="grid md:grid-cols-5 sm:grid-cols-4 gap-1 grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 grid-rows-12">
				{products.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						rep={marketplaceRep}
					/>
				))}
			</div>
		</section>
	);
};
export { Products };

const ProductCard = ({
	product,
	rep,
}: { product: PublishedProduct; rep: Replicache | null }) => {
	const variantMap = useMarketplaceStore((state) => state.variantMap);
	const defaultVariant = variantMap.get(product.defaultVariantID);
	if (!defaultVariant) return null;
	if (!rep) return null;
	return (
		<Link
			to={`/marketplace/products/${product.defaultVariant.handle}`}
			prefetch="intent"
			className={cn(
				"group border hover:scale-[103%] col-span-1 row-span-1 hover:z-20 cursor-pointer relative border-mauve-5 dark:border-mauve-7   h-fit rounded-lg transition-all duration-200 ease-in-out",
				{
					"col-span-2 row-span-2": (product.score ?? 0) > 1,
				},
			)}
			unstable_viewTransition={true}
			preventScrollReset={true}
		>
			{product.defaultVariant.thumbnail ? (
				<Image
					className="h-auto aspect-square max-w-full rounded-lg hover:brightness-50"
					src={product.defaultVariant?.thumbnail?.url}
					alt=""
					fit="contain"
					quality={100}
				/>
			) : (
				<div className="aspect-square min-h-36 bg-component max-w-full rounded-lg hover:brightness-50">
					<ImagePlaceholder />
				</div>
			)}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black-a-7 dark:from-transparent dark:to-black-a-6 to-black-a-11 rounded-lg opacity-0 group-hover:opacity-70 transition duration-450 ease-in-out" />
			<div className="flex absolute flex-end w-full px-2 bottom-0  rounded-b-lg">
				<div className="group-hover:opacity-100 rounded-b-lg w-full opacity-0 transition-all duration-200 ease-in-out p-2">
					<h1 className="font-freeman line-clamp-1 group-hover:blur-1px text-white dark:text-black text-ellipsis overflow-hidden">
						{product.defaultVariant.title}
					</h1>
					<div className="hidden lg:block ">
						<p className="overflow-hidden line-clamp-2 text-xs text-mauve-2 group-hover:blur-1px font-semibold">
							{product.defaultVariant.description ?? ""}
						</p>
					</div>
				</div>
			</div>

			<span className="absolute top-2 right-2 text-crimson-9 font-freeman flex gap-2 text-sm md:text-base border border-crimson-9 backdrop-blur-md rounded-xl p-1">
				<Price
					className="text-xs md:text-sm font-freeman flex-none text-crimson-9 rounded-xl"
					amount={defaultVariant.prices[0]!.amount}
					currencyCode={defaultVariant.prices[0]!.currencyCode}
					currencyCodeClassName="hidden @[275px]/label:inline"
				/>
			</span>
		</Link>
	);
};
