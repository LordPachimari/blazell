import { cn } from "@blazell/ui";
import { LoadingSpinner } from "@blazell/ui/loading";
import type { PublishedProduct } from "@blazell/validators/client";
import { Link } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import type { Replicache } from "replicache";
import Image from "~/components/molecules/image";
import Price from "~/components/molecules/price";
import { useWindowSize } from "~/hooks/use-window-size";
import { generateGrid, type SquareCounts } from "~/utils/grid-generator";
import { useMarketplaceStore } from "~/zustand/store";

interface ProductsProps {
	marketplaceRep: Replicache | null;
	category: string;
}

function useResponsiveGrid() {
	const size = useWindowSize(50);
	const [gridState, setGridState] = useState({ cols: 8, rows: 12 });

	useEffect(() => {
		if (size.width && size.width < 640) {
			setGridState({ cols: 3, rows: 12 });
		} else if (size.width && size.width < 768) {
			setGridState({ cols: 4, rows: 12 });
		} else if (size.width && size.width < 1024) {
			setGridState({ cols: 5, rows: 12 });
		} else if (size.width && size.width < 1280) {
			setGridState({ cols: 6, rows: 12 });
		} else if (size.width && size.width < 1536) {
			setGridState({ cols: 8, rows: 12 });
		} else {
			setGridState({ cols: 10, rows: 12 });
		}
	}, [size.width]);

	return gridState;
}

const Products = ({ marketplaceRep }: ProductsProps) => {
	const gridState = useResponsiveGrid();
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	const products = useMarketplaceStore((state) => state.products);
	const productMap = useMarketplaceStore((state) => state.productMap);
	const highScoreEntities: { id: string }[] = [];
	const lowScoreEntities: { id: string }[] = [];

	for (const entry of products) {
		if ((entry.score ?? 0) <= 1) {
			lowScoreEntities.push(entry);
		} else {
			highScoreEntities.push(entry);
		}
	}
	const squareSizes: SquareCounts = useMemo(
		() => ({
			2: 6,
			1: Number.POSITIVE_INFINITY,
		}),
		[],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const generatedGrid = useMemo(
		() =>
			generateGrid(
				gridState.rows,
				gridState.cols,
				squareSizes,
				highScoreEntities,
				lowScoreEntities,
			),
		[highScoreEntities, lowScoreEntities, gridState, squareSizes],
	);
	if (!isInitialized)
		return (
			<section className="flex w-screen h-screen justify-center mt-72">
				<LoadingSpinner className="w-12 h-12 mr-14" />
			</section>
		);
	return (
		<section className="flex flex-col gap-2">
			{generatedGrid.map((grid, index) => {
				const idSet = new Set<string>();
				const flattedGrid: { id: string; size: number }[] = [];

				for (let i = 0; i < grid.length; i++) {
					for (let j = 0; j < grid[0]!.length; j++) {
						const value = grid[i]?.[j];
						if (value && !idSet.has(value.id)) {
							flattedGrid.push(value);
							idSet.add(value.id);
						}
					}
				}

				return (
					<div
						key={index}
						className="grid md:grid-cols-5 sm:grid-cols-4 gap-1 grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 grid-rows-12"
					>
						{flattedGrid.map((gridValue) => {
							const entity = productMap.get(gridValue.id)!;
							return (
								<ProductCard
									key={entity.id}
									product={entity}
									rep={marketplaceRep}
								/>
							);
						})}
					</div>
				);
			})}
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
				"group border hover:scale-[103%] col-span-1 row-span-1 hover:z-20 cursor-pointer relative border-mauve-7 h-fit rounded-lg transition-all duration-200 ease-in-out",
				{
					"col-span-2 row-span-2": (product.score ?? 0) > 1,
				},
			)}
			unstable_viewTransition={true}
			preventScrollReset={true}
		>
			<Image
				className="h-auto aspect-square max-w-full rounded-lg hover:brightness-50"
				src={product.defaultVariant?.thumbnail?.url}
				alt=""
				fit="contain"
				quality={100}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black-a-7 dark:from-transparent dark:to-black-a-6 to-black-a-11 rounded-lg opacity-0 group-hover:opacity-70 transition duration-450 ease-in-out" />
			<div className="flex absolute flex-end w-full px-2 bottom-0  rounded-b-lg">
				<div className="group-hover:opacity-100 rounded-b-lg w-full opacity-0 transition-all duration-200 ease-in-out p-2">
					<h1 className="font-freeman line-clamp-1 group-hover:blur-1px text-white dark:text-black text-ellipsis overflow-hidden">
						{product.defaultVariant.title}
					</h1>
					<p className="hidden line-clamp-2 text-xs md:flex text-mauve-2 group-hover:blur-1px font-semibold text-ellipsis overflow-hidden">
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
