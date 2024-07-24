import { cn } from "@blazell/ui";
import { Card, CardContent, CardFooter } from "@blazell/ui/card";
import { Noise } from "@blazell/ui/noise";
import { Skeleton } from "@blazell/ui/skeleton";
import type { Product, Store } from "@blazell/validators/client";
import { Outlet } from "@remix-run/react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import React, { useEffect, useState } from "react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import Price from "~/components/molecules/price";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { StoreInfo } from "~/components/templates/store/store-info";
import { useMarketplaceStore } from "~/zustand/store";
import { Products } from "./components/products";

export default function MarketplaceLayout() {
	return (
		<SidebarLayoutWrapper>
			<div className="absolute -z-10 left-0 right-0 h-[550px] opacity-60 bg-gradient-to-b from-brand-2 to-transparent " />
			<main className="p-2 lg:p-4 mt-16 flex flex-col justify-center ">
				<Featured />
				<Products />
			</main>
			<Outlet />
		</SidebarLayoutWrapper>
	);
}
const Featured = () => {
	const stores = useMarketplaceStore((state) => state.stores);
	if (stores.length < 5) {
		return <Featured3 stores={stores} />;
	}
	return <Featured5 stores={stores} />;
};

const Featured3 = ({ stores }: { stores: Store[] }) => {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [direction, setDirection] = useState<number>(0);
	console.log("stores", stores);

	useEffect(() => {
		if (stores.length > 0) {
			setCurrentIndex(0);
		}
	}, [stores]);

	if (!stores || stores.length === 0) {
		return null;
	}
	const slideVariants = {
		hidden: (custom: {
			direction: number;
			position: "left" | "center" | "right";
		}) => ({
			x: custom.direction > 0 ? "100%" : "-100%",
			scale: 0.8,
			opacity: 0,
		}),
		visible: (custom: { position: "left" | "center" | "right" }) => ({
			x:
				custom.position === "left"
					? "-50%"
					: custom.position === "right"
						? "50%"
						: "0%",
			scale: custom.position === "center" ? 1 : 0.8,
			zIndex: custom.position === "center" ? 2 : 1,
			opacity: 1,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		}),
		exit: (custom: {
			direction: number;
			position: "left" | "center" | "right";
		}) => ({
			x: custom.direction < 0 ? "100%" : "-100%",
			scale: 0.8,
			opacity: 0,
		}),
	};

	const swipe = (newDirection: number): void => {
		setDirection(newDirection);
		setCurrentIndex((prevIndex) => {
			let newIndex = prevIndex + newDirection;
			if (newIndex < 0) newIndex = stores.length - 1;
			if (newIndex >= stores.length) newIndex = 0;
			return newIndex;
		});
	};

	const dragEndHandler = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	): void => {
		const swipeThreshold = 50;
		if (info.offset.x > swipeThreshold) {
			swipe(-1);
		} else if (info.offset.x < -swipeThreshold) {
			swipe(1);
		}
	};

	return (
		<div className="mb-10 hidden lg:block">
			<div className="relative h-[410px] overflow-hidden">
				<AnimatePresence initial={false} custom={{ direction }}>
					{[-1, 0, 1].map((offset) => {
						const index =
							(currentIndex + offset + stores.length) % stores.length;
						const position =
							offset === -1 ? "left" : offset === 0 ? "center" : "right";
						return (
							<motion.div
								key={stores[index]!.id}
								custom={{ direction, position }}
								variants={slideVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								className={cn(
									"absolute top-0  left-[30%] p-2 -translate-x-1/2  w-5/12 h-full",
									"flex justify-center",
									position !== "center" && "hidden md:flex",
								)}
								drag={position === "center" ? "x" : false}
								dragConstraints={
									position === "center" ? { left: 0, right: 0 } : {}
								}
								onDragEnd={position === "center" ? dragEndHandler : () => {}}
								onClick={() => {
									if (position === "left") swipe(-1);
									if (position === "right") swipe(1);
								}}
							>
								<StoreComponent store={stores[index]!} />
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
};
const Featured5 = ({ stores }: { stores: Store[] }) => {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [direction, setDirection] = useState<number>(0);
	console.log("stores", stores);

	useEffect(() => {
		if (stores.length > 0) {
			setCurrentIndex(0);
		}
	}, [stores]);

	if (!stores || stores.length === 0) {
		return null;
	}

	const slideVariants = {
		hidden: (custom: {
			direction: number;
			position: "far-left" | "left" | "center" | "right" | "far-right";
		}) => ({
			x: custom.direction > 0 ? "100%" : "-100%",
			scale: 0.6,
			opacity: 0,
		}),
		visible: (custom: {
			position: "far-left" | "left" | "center" | "right" | "far-right";
		}) => ({
			x:
				custom.position === "far-left"
					? "-60%"
					: custom.position === "left"
						? "-40%"
						: custom.position === "right"
							? "40%"
							: custom.position === "far-right"
								? "60%"
								: "0%",
			scale:
				custom.position === "center"
					? 1
					: custom.position === "left" || custom.position === "right"
						? 0.8
						: 0.6,
			zIndex:
				custom.position === "center"
					? 5
					: custom.position === "left" || custom.position === "right"
						? 3
						: 1,
			opacity: 1,
			transition: { type: "spring", stiffness: 300, damping: 30 },
		}),
		exit: (custom: {
			direction: number;
			position: "far-left" | "left" | "center" | "right" | "far-right";
		}) => ({
			x: custom.direction < 0 ? "100%" : "-100%",
			scale: 0.6,
			opacity: 0,
		}),
	};

	const swipe = (newDirection: number): void => {
		setDirection(newDirection);
		setCurrentIndex((prevIndex) => {
			let newIndex = prevIndex + newDirection;
			if (newIndex < 0) newIndex = stores.length - 1;
			if (newIndex >= stores.length) newIndex = 0;
			return newIndex;
		});
	};

	const dragEndHandler = (
		_: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo,
	): void => {
		const swipeThreshold = 50;
		if (info.offset.x > swipeThreshold) {
			swipe(-1);
		} else if (info.offset.x < -swipeThreshold) {
			swipe(1);
		}
	};

	return (
		<div className="mb-10 hidden lg:block">
			<div className="relative h-[410px] overflow-hidden">
				<AnimatePresence initial={false} custom={{ direction }}>
					{[-2, -1, 0, 1, 2].map((offset) => {
						const index =
							(currentIndex + offset + stores.length) % stores.length;
						const position =
							offset === -2
								? "far-left"
								: offset === -1
									? "left"
									: offset === 0
										? "center"
										: offset === 1
											? "right"
											: "far-right";
						return (
							<motion.div
								key={stores[index]!.id}
								custom={{ direction, position }}
								variants={slideVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
								className={cn(
									"absolute top-0 left-[30%] p-2 -translate-x-1/2 w-5/12 h-full",
									"flex justify-center",
									position === "far-left" || position === "far-right"
										? "hidden lg:flex"
										: "hidden md:flex",
								)}
								drag={position === "center" ? "x" : false}
								dragConstraints={
									position === "center" ? { left: 0, right: 0 } : {}
								}
								onDragEnd={position === "center" ? dragEndHandler : () => {}}
								onClick={() => {
									if (position === "far-left" || position === "left") swipe(-1);
									if (position === "far-right" || position === "right")
										swipe(1);
								}}
							>
								<StoreComponent store={stores[index]!} />
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
};
const StoreComponent = ({ store }: { store: Store }) => {
	const isInitialized = useMarketplaceStore((state) => state.isInitialized);
	return (
		<Card className={cn("relative p-2 w-full ")}>
			<CardContent>
				<div
					className={cn(
						"max-h-[120px] md:min-h-[120px] h-fit w-full overflow-hidden rounded-lg p-0 relative grid grid-cols-1",
					)}
				>
					{!isInitialized && <Skeleton className="w-full h-[120px]" />}
					{store.headerImage?.croppedImage?.url ? (
						<Image
							fit="cover"
							src={store.headerImage.croppedImage?.url}
							alt="header"
							className="rounded-lg w-full object-cover"
						/>
					) : (
						<div className="h-[120px] w-full bg-slate-4 ">
							<Noise />
						</div>
					)}
				</div>
				<StoreInfo
					store={store}
					productCount={store.products?.length ?? 0}
					isInitialized={isInitialized}
					size="small"
				/>
			</CardContent>
			<CardFooter className="p-0 pt-2">
				<ProductSection
					isInitialized={isInitialized}
					products={store.products ?? []}
				/>
			</CardFooter>
		</Card>
	);
};
const ProductSection = ({
	products,
	isInitialized,
}: {
	products: Product[];
	isInitialized: boolean;
}) => {
	const slicedProducts = React.useMemo(
		() => (products?.length > 4 ? products.slice(0, 4) : products),
		[products],
	);
	return (
		<section className="w-full pb-0">
			<section className="grid grid-cols-4 gap-2">
				{!isInitialized &&
					Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="w-full h-[300px]" />
					))}
				{products.length === 0 && (
					<p className="text-slate-11">No products found.</p>
				)}
				{slicedProducts?.map((product) => (
					<ProductCard product={product} key={product.id} />
				))}
			</section>
		</section>
	);
};
const ProductCard = ({
	product,
}: {
	product: Product;
}) => {
	const variantMap = useMarketplaceStore((state) => state.variantMap);

	const defaultVariant = variantMap.get(product.defaultVariantID);
	return (
		<div className="relative aspect-square p-0">
			<CardContent className="relative flex h-full w-full flex-col gap-4">
				<section className="flex h-full w-full  border border-border	  overflow-hidden rounded-lg items-center justify-center">
					{!defaultVariant?.thumbnail?.url ? (
						<ImagePlaceholder />
					) : (
						<Image
							src={defaultVariant?.thumbnail?.url}
							alt={defaultVariant?.thumbnail?.name ?? "Product image"}
							className="rounded-lg"
							fit="cover"
						/>
					)}
				</section>
			</CardContent>

			<span className="absolute top-1 right-1 text-brand-9 font-freeman flex gap-2 text-sm md:text-base border border-brand-9 bg-brand-3 rounded-lg p-1">
				<Price
					className="text-xs md:text-sm font-freeman flex-none text-brand-9 rounded-lg"
					amount={defaultVariant?.prices?.[0]?.amount ?? 0}
					currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "AUD"}
					currencyCodeClassName="hidden @[275px]/label:inline"
				/>
			</span>
		</div>
	);
};
