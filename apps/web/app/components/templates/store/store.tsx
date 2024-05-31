import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import { Noise } from "@blazell/ui/noise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@blazell/ui/tabs";
import type { Product, Store as StoreType } from "@blazell/validators/client";
import { Link, useNavigate } from "@remix-run/react";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { ProductCard } from "../product/product-card";
import { StoreInfo } from "./store-info";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";

export function Store({
	store,
}: {
	store: StoreType | undefined;
}) {
	const rep = useReplicache((state) => state.dashboardRep);
	const products = ReplicacheStore.scan<Product>(rep, `product_${store?.id}`);
	const navigate = useNavigate();
	console.log("header", store?.headerImage);
	return (
		<div className="relative">
			<Button
				variant="ghost"
				className="fixed text-black dark:text-white hover:bg-mauve-a-3 top-4 left-30  z-20"
				onClick={() => navigate("/dashboard/select-stores")}
			>
				<Icons.left size={20} className="text-black dark:text-white" />
				Select stores
			</Button>

			<div
				className={cn(
					"max-h-[210px] h-fit w-full overflow-hidden rounded-2xl p-0 relative grid grid-cols-1 border border-mauve-7",
					{
						"h-[210px]": !store?.headerImage?.croppedImage,
					},
				)}
			>
				{store?.headerImage?.croppedImage ? (
					store.headerImage.croppedImage.uploaded ? (
						<Image
							fit="fill"
							quality={100}
							src={store.headerImage.croppedImage?.url}
							alt="header"
							className="rounded-2xl"
						/>
					) : (
						<img
							src={toImageURL(
								store.headerImage.croppedImage.base64,
								store.headerImage.croppedImage.fileType,
							)}
							alt="header"
							className={cn("rounded-2xl w-full object-fill", {
								"h-[210px]": !store.headerImage.croppedImage.base64,
							})}
						/>
					)
				) : (
					<div className="h-[210px] w-full bg-crimson-7 ">
						<Noise />
					</div>
				)}
			</div>

			<StoreInfo store={store} productCount={products.length} />

			<Tabs defaultValue="products" className="mt-6">
				<TabsList variant="outline">
					<TabsTrigger value="products" variant="outline">
						Products
					</TabsTrigger>
					<TabsTrigger value="announcements" variant="outline">
						Announcements
					</TabsTrigger>
				</TabsList>
				<TabsContent value="products">
					<ProductSection products={products} />
				</TabsContent>
				<TabsContent value="announcements">No announcements.</TabsContent>
			</Tabs>
		</div>
	);
}
const ProductSection = ({
	products,
}: {
	products: Product[];
}) => {
	return (
		<section className="w-full">
			<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
				{products.map((product) => (
					<Link
						key={product.id}
						to={`/dashboard/products/${product.id}`}
						unstable_viewTransition
						prefetch="viewport"
					>
						<ProductCard product={product} key={product.id} />
					</Link>
				))}
			</section>
		</section>
	);
};
