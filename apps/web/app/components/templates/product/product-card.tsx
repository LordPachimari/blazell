import type { Product, Variant } from "@blazell/validators/client";
import PriceLabel from "~/components/molecules/price-label";
import { Card, CardContent, CardFooter } from "@blazell/ui/card";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

const ProductCard = ({
	product,
}: {
	product: Product;
}) => {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const variants = ReplicacheStore.scan<Variant>(
		dashboardRep,
		`variant_${product.id}`,
	);
	const defaultVariant = variants?.[0];
	return (
		<Card className="aspect-square p-4 min-w-[15rem] cursor-pointer">
			<CardContent className="relative flex h-full w-full flex-col gap-4">
				<section className="flex h-full w-full  border border-mauve-7 rounded-lg items-center justify-center">
					{!product.defaultVariant.thumbnail ? (
						<ImagePlaceholder />
					) : product.defaultVariant.thumbnail?.uploaded ? (
						<Image
							src={product.defaultVariant.thumbnail?.url}
							alt={product.defaultVariant.thumbnail?.name ?? "Product image"}
							className="rounded-xl"
						/>
					) : (
						<img
							src={toImageURL(
								product.defaultVariant.thumbnail.base64,
								product.defaultVariant.thumbnail.fileType,
							)}
							alt={product.defaultVariant.thumbnail?.name ?? "Product image"}
							className="rounded-xl"
						/>
					)}
				</section>
			</CardContent>
			<CardFooter className="flex w-full flex-col items-center p-2 h-13 justify-between ">
				<section className="relative h-full md:p-0 w-full ">
					<h1 className="line-clamp-2  text-base truncate font-bold text-ellipsis overflow-hidden">
						{product?.defaultVariant.title ?? ""}
					</h1>
				</section>
				<PriceLabel
					amount={defaultVariant?.prices?.[0]?.amount ?? 0}
					currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "USD"}
					title={defaultVariant?.prices?.[0]?.currencyCode ?? "USD"}
				/>
			</CardFooter>
		</Card>
	);
};

export { ProductCard };
