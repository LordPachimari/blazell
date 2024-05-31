import type { Product } from "@blazell/validators/client";
import { useEffect, useMemo, useState } from "react";
import type { Replicache } from "replicache";
import { generateGrid } from "./grid";
import Image from "~/components/molecules/image";
import PriceLabel from "~/components/molecules/price-label";
import { ReplicacheStore } from "~/replicache/store";
import { generateReplicachePK } from "@blazell/utils";
import type { PublishedVariant } from "@blazell/validators";
import { Link } from "@remix-run/react";
import Price from "~/components/molecules/price";
import { useWindowSize } from "@uidotdev/usehooks";

interface ProductsProps {
	marketplaceRep: Replicache | null;
	category: string;
}

const Products = ({ marketplaceRep }: ProductsProps) => {
	const [data, setData] = useState<Product[]>([]);
	const windowSize = useWindowSize();
	useEffect(() => {
		marketplaceRep?.experimentalWatch(
			(diffs) => {
				for (const diff of diffs) {
					if (diff.op === "add") {
						setData((prev) => [
							...(prev || []),
							structuredClone(diff.newValue) as Product,
						]);
					}

					if (diff.op === "change") {
						setData((prev) => [
							...(prev
								? prev.filter(
										(item) =>
											(item as { replicachePK: string }).replicachePK !==
											diff.key,
									)
								: []),
							structuredClone(diff.newValue) as Product,
						]);
					}

					if (diff.op === "del") {
						setData((prev) =>
							prev
								? prev.filter(
										(item) =>
											(item as { replicachePK: string }).replicachePK !==
											diff.key,
									)
								: [],
						);
					}
				}
			},
			{ prefix: "product", initialValuesInFirstDiff: true },
		);
	}, [marketplaceRep]);
	const productGrids = useMemo(
		() =>
			generateGrid({
				data,
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
		[data, windowSize.width],
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
}: { product: Product; rep: Replicache | null }) => {
	const defaultVariant = ReplicacheStore.getByPK<PublishedVariant>(
		rep,
		generateReplicachePK({
			prefix: "default_var",
			filterID: product.id,
			id: product.defaultVariantID,
		}),
	);
	console.log("defaultVariant", defaultVariant);
	if (!defaultVariant) return null;
	if (!rep) return null;
	return (
		<Link
			to={`/marketplace/products/${product.defaultVariant.handle}`}
			prefetch="viewport"
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
