import { Icons } from "@pachi/ui/icons";
import { Noise } from "@pachi/ui/noise";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { StoreInfo } from "./store-info";
import { cn } from "@pachi/ui";
import { Button } from "@pachi/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pachi/ui/tabs";
import type { Product, Store as StoreType } from "@pachi/validators/client";
import { Image } from "~/components/image";
import { ProductCard } from "../product/product-card";
import { Link } from "@remix-run/react";
import { AspectRatio } from "@pachi/ui/aspect-ratio";

export function Store({
	store,
}: {
	store: StoreType | undefined;
}) {
	const rep = useReplicache((state) => state.dashboardRep);
	const products = ReplicacheStore.scan<Product>(rep, `product_${store?.id}`);
	return (
		<div className="relative">
			<Button
				variant="ghost"
				href="/dashboard/select-stores"
				className="fixed text-black dark:text-white hover:bg-mauve-a-3 top-4 left-30  z-20"
			>
				<Icons.left size={20} className="text-black dark:text-white" />
				Select stores
			</Button>
			{store?.headerImage?.croppedUrl ? (
				<AspectRatio
					ratio={4 / 1}
					className={cn(
						"max-h-fit rounded-lg relative w-full grid grid-cols-1 border border-mauve-6",
					)}
				>
					<Image
						fit="fill"
						src={store.headerImage.croppedUrl}
						alt="header"
						className="rounded-lg"
						height={208}
					/>
				</AspectRatio>
			) : (
				<div className="h-[210px] rounded-lg w-full grid grid-cols-1 border bg-crimson-7 border-mauve-6">
					<Noise />
				</div>
			)}

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
