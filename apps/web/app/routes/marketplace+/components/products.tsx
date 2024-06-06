import type { PublishedProduct } from "@blazell/validators/client";
import { Link } from "@remix-run/react";
import { useWindowSize } from "@uidotdev/usehooks";
import { useMemo } from "react";
import type { Replicache } from "replicache";
import Image from "~/components/molecules/image";
import Price from "~/components/molecules/price";
import { useMarketplaceStore } from "~/zustand/store";
import { generateGrid } from "./grid";

interface ProductsProps {
	marketplaceRep: Replicache | null;
	category: string;
}

const Products = ({ marketplaceRep }: ProductsProps) => {
	const products = useMarketplaceStore((state) => state.products);
	const windowSize = useWindowSize();
	const productGrids = useMemo(
		() =>
			generateGrid({
				data: products,
				columns: !windowSize.width
					? 5
					: windowSize.width < 640
						? 2
						: windowSize.width < 768
							? 3
							: windowSize.width < 1024
								? 4
								: windowSize.width < 1280
									? 5
									: 6,
			}),
		[products, windowSize.width],
	);
	return (
		<div className="p-2 md:p-6 md:pt-10 flex flex-col gap-4">
			{productGrids.map((grid, index) => (
				<div
					key={index}
					className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
				>
					{grid.map((column, columnIndex) => (
						<div key={columnIndex} className="flex flex-col gap-2">
							{column.map((product) => {
								console.log("product", product);
								if (!product) return null;
								return (
									<ProductCard
										key={product.id}
										product={product}
										rep={marketplaceRep}
									/>
								);
							})}
						</div>
					))}
				</div>
			))}
		</div>
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
			className="group border hover:scale-105 cursor-pointer relative border-mauve-7 h-fit rounded-lg transition-all duration-200 ease-in-out"
			unstable_viewTransition={true}
		>
			<Image
				className="h-auto max-w-full rounded-lg hover:brightness-50"
				src={product.defaultVariant?.thumbnail?.url}
				alt=""
				fit="fill"
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black-a-7 dark:from-transparent dark:to-black-a-6 to-black-a-11 rounded-lg opacity-0 group-hover:opacity-70 transition duration-450 ease-in-out" />
			<div className="flex absolute flex-end w-full px-2 bottom-0 group-hover:backdrop-blur-[1px] rounded-b-lg">
				<div className="group-hover:opacity-100 rounded-b-lg w-full opacity-0 transition-all duration-200 ease-in-out p-2">
					<h1 className="font-freeman line-clamp-1 text-white dark:text-black text-ellipsis overflow-hidden">
						{product.defaultVariant.title}
					</h1>
					<p className="hidden line-clamp-2 text-xs md:flex text-mauve-2 font-semibold text-ellipsis overflow-hidden">
						{product.description ?? ""}
					</p>
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
