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
		<Card className="relative aspect-square p-2 min-w-[15rem] cursor-pointer lg:hover:scale-105 lg:transition-all lg:duration-100 lg:ease-out">
			<CardContent className="relative flex h-full w-full flex-col gap-4">
				<section className="flex h-full w-full  border border-border   overflow-hidden rounded-lg items-center justify-center">
					{!defaultVariant?.thumbnail ? (
						<ImagePlaceholder />
					) : defaultVariant?.thumbnail?.uploaded ? (
						<Image
							src={defaultVariant?.thumbnail?.url}
							alt={defaultVariant?.thumbnail?.name ?? "Product image"}
							className="rounded-lg"
							fit="cover"
						/>
					) : (
						<img
							src={toImageURL(
								defaultVariant?.thumbnail.base64,
								defaultVariant?.thumbnail.fileType,
							)}
							alt={defaultVariant?.thumbnail?.name ?? "Product image"}
							className="rounded-lg object-cover"
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

			<span className="absolute top-4 right-4 text-brand-9 font-freeman flex gap-2 text-sm md:text-base border border-brand-9 backdrop-blur-md rounded-lg p-1">
				<Price
					className="text-xs md:text-sm font-freeman flex-none text-brand-9 rounded-lg"
					amount={defaultVariant?.prices?.[0]?.amount ?? 0}
					currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "AUD"}
					currencyCodeClassName="hidden @[275px]/label:inline"
				/>
			</span>
		</Card>
	);
};

export { ProductCard };
