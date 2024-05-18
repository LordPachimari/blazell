import type { Product, Variant } from "@pachi/validators/client";
import PriceLabel from "~/components/molecules/price-label";
import { Card, CardContent, CardFooter } from "@pachi/ui/card";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { Image } from "~/components/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";

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
				<section className="flex h-full w-full  border border-mauve-6 rounded-lg items-center justify-center">
					{product.thumbnail ? (
						<Image
							src={product.thumbnail?.preview ?? product.thumbnail?.url ?? ""}
							fit="fill"
							alt={product.thumbnail?.name ?? "Product image"}
							className="rounded-xl"
						/>
					) : (
						<ImagePlaceholder />
					)}
				</section>
			</CardContent>
			<CardFooter className="flex w-full flex-col items-center p-2 h-13 justify-between ">
				<section className="relative h-full md:p-0 w-full ">
					<h1 className="line-clamp-2  text-base truncate font-bold text-ellipsis overflow-hidden">
						{product?.title ?? ""}
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