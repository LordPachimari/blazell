import { cn } from "@blazell/ui";
import { Noise } from "@blazell/ui/noise";
import { Skeleton } from "@blazell/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@blazell/ui/tabs";
import type {
	Product,
	PublishedProduct,
	Store as StoreType,
	Variant,
} from "@blazell/validators/client";
import { Link } from "@remix-run/react";
import Image from "~/components/molecules/image";
import { toImageURL } from "~/utils/helpers";
import { ProductCard } from "../product/product-card";
import { StoreInfo } from "./store-info";

export function Store({
	store,
	isInitialized,
	products,
	variantMap,
	isDashboard = false,
}: {
	store: StoreType | undefined;
	isInitialized: boolean;
	products: (Product | PublishedProduct)[];
	variantMap: Map<string, Variant>;
	isDashboard?: boolean;
}) {
	return (
		<div className="relative max-w-7xl w-full">
			<div
				className={cn(
					"max-h-[210px] md:min-h-[210px] h-fit w-full overflow-hidden rounded-lg p-0 relative grid grid-cols-1 border border-border  ",
				)}
			>
				{!isInitialized && <Skeleton className="w-full h-[210px]" />}
				{store?.headerImage?.croppedImage ? (
					store.headerImage.croppedImage.uploaded ? (
						<Image
							fit="cover"
							src={store.headerImage.croppedImage?.url}
							alt="header"
							className="rounded-lg w-full object-cover"
						/>
					) : (
						<img
							src={toImageURL(
								store.headerImage.croppedImage.base64,
								store.headerImage.croppedImage.fileType,
							)}
							alt="header"
							className={cn("rounded-lg w-full object-cover", {
								"h-[210px]": !store.headerImage.croppedImage.base64,
							})}
						/>
					)
				) : (
					<div className="h-[210px] w-full bg-slate-4">
						<Noise />
					</div>
				)}
			</div>

			<StoreInfo
				store={store}
				productCount={products?.length ?? 0}
				isInitialized={isInitialized}
				isDashboard={isDashboard}
			/>

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
					<ProductSection
						products={products}
						isInitialized={!!isInitialized}
						variantMap={variantMap}
						isDashboard={isDashboard}
					/>
				</TabsContent>
				<TabsContent value="announcements">
					<p className="text-slate-11">No announcements found.</p>
				</TabsContent>
			</Tabs>
		</div>
	);
}
const ProductSection = ({
	products,
	isInitialized,
	variantMap,
	isDashboard,
}: {
	products: (Product | PublishedProduct)[];
	isInitialized: boolean;
	variantMap: Map<string, Variant>;
	isDashboard?: boolean;
}) => {
	return (
		<section className="w-full pb-14 sm:pb-0">
			<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
				{!isInitialized &&
					Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="w-full h-[300px]" />
					))}
				{products.length === 0 && (
					<p className="text-slate-11">No products found.</p>
				)}
				{products?.map((product) => (
					<Link
						key={product.id}
						to={
							isDashboard
								? `/dashboard/products/${product.id}`
								: `/stores/${product.store.name}/products/${product.defaultVariant.handle}`
						}
						prefetch="viewport"
						className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1"
					>
						<ProductCard
							product={product}
							key={product.id}
							variantMap={variantMap}
						/>
					</Link>
				))}
			</section>
		</section>
	);
};
