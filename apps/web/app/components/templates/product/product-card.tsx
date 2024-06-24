import { Card, CardContent, CardFooter } from "@blazell/ui/card";
import type { Product } from "@blazell/validators/client";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Price from "~/components/molecules/price";
import { toImageURL } from "~/utils/helpers";
import { useDashboardStore } from "~/zustand/store";

const ProductCard = ({
	product,
}: {
	product: Product;
}) => {
	const variantMap = useDashboardStore((state) => state.variantMap);

	const defaultVariant = variantMap.get(product.defaultVariantID);
	return (
		<Card className="relative aspect-square p-2 min-w-[15rem] cursor-pointer hover:scale-105 transition-all duration-100 ease-out">
			<CardContent className="relative flex h-full w-full flex-col gap-4">
				<section className="flex h-full w-full  border border-mauve-5 dark:border-mauve-7   overflow-hidden rounded-xl items-center justify-center">
					{!defaultVariant?.thumbnail ? (
						<ImagePlaceholder />
					) : defaultVariant?.thumbnail?.uploaded ? (
						<Image
							src={defaultVariant?.thumbnail?.url}
							alt={defaultVariant?.thumbnail?.name ?? "Product image"}
							className="rounded-xl"
							fit="cover"
						/>
					) : (
						<img
							src={toImageURL(
								defaultVariant?.thumbnail.base64,
								defaultVariant?.thumbnail.fileType,
							)}
							alt={defaultVariant?.thumbnail?.name ?? "Product image"}
							className="rounded-xl object-cover"
						/>
					)}
				</section>
			</CardContent>
			<CardFooter className="flex w-full flex-col items-center p-2 h-13 justify-between ">
				<section className="relative h-full md:p-0 w-full ">
					<h1 className="line-clamp-1 text-base truncate font-bold text-ellipsis overflow-hidden">
						{defaultVariant?.title ?? "Untitled"}
					</h1>
				</section>
			</CardFooter>

			<span className="absolute top-4 right-4 text-crimson-9 font-freeman flex gap-2 text-sm md:text-base border border-crimson-9 backdrop-blur-md rounded-xl p-1">
				<Price
					className="text-xs md:text-sm font-freeman flex-none text-crimson-9 rounded-xl"
					amount={defaultVariant?.prices?.[0]?.amount ?? 0}
					currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "AUD"}
					currencyCodeClassName="hidden @[275px]/label:inline"
				/>
			</span>
		</Card>
	);
};

export { ProductCard };
