import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import { Card, CardContent } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { Ping } from "@blazell/ui/ping";
import { Skeleton } from "@blazell/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import { useState } from "react";
import Image from "~/components/molecules/image";
import { AnimatedBeamDemo } from "./animated-beam";
import { AnimatedList } from "./animated-list";
import { OrbitingPayment, OrbitingShipping } from "./orbiting-circle";

type Feature = {
	title: string;
};

const features: Feature[] = [
	{
		title: "Real Time",
	},
	{
		title: "Shipping",
	},
	{
		title: "Payment",
	},
	{
		title: "Sales Channels",
	},
];

const RealTime = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				"w-full grid grid-cols-1 sm:grid-cols-2 gap-4 grid-rows-2 relative transition-transform duration-300 ease-in-out",
				className,
			)}
		>
			<div className="col-span-1 row-span-2 justify-center gap-10 flex flex-col items-center">
				<h2 className="font-freeman p-2 text-2xl">
					The platform is{" "}
					<span className="bg-gradient-to-b from-brand-9 to-brand-11 text-transparent bg-clip-text">
						alive
					</span>
					! Host interactive live auctions, manage events like scheduling
					merchandise drops, orders, delivery, inventory tracking, all in
					real-time.
				</h2>
				<div className="relative">
					<Image
						src="/assets/live.jpg"
						className="h-[500px] object-cover rounded-lg"
					/>
					<div className="absolute top-2 right-2 bg-red-9 p-2 rounded-lg ">
						<p className="font-bold text-white">Live </p>
					</div>
					<div className="flex absolute bottom-0 w-full justify-between p-2 gap-2">
						<Button variant={"outline"} className="w-full ">
							Custom
						</Button>
						<Button className="w-full ">Bid $100</Button>
					</div>
				</div>
			</div>
			<Card className="w-full col-span-1 row-span-1">
				<CardContent>
					<h2 className="font-freeman font-black text-2xl">Orders</h2>
					<div className="w-full flex items-center gap-2 py-2">
						<Ping />
						<p className="text-brand-9 text-sm font-bold">Real time</p>
					</div>

					<div className="flex">
						<Image
							src="/assets/order-3.jpeg"
							className="w-28 h-36 object-cover rounded-lg"
							//turn tailwind 32 and 40 to pixels
							width={112}
							height={144}
							fit="cover"
						/>
						<div className="w-full px-4 flex flex-col gap-3">
							<Skeleton className="h-7 w-full rounded-2xl" />
							<Skeleton className="h-4 w-full rounded-2xl" />
							<Skeleton className="h-4 w-full rounded-2xl" />
							<Skeleton className="h-4 w-3/4 rounded-2xl" />
						</div>
					</div>
					<div className="flex py-4">
						<Image
							src="/assets/order-2.jpeg"
							className="w-28 h-36 object-cover rounded-lg"
							//turn tailwind 32 and 40 to pixels
							width={112}
							height={144}
							fit="cover"
						/>
						<div className="w-full px-4 flex flex-col gap-3">
							<Skeleton className="h-7 w-full rounded-2xl" />
							<Skeleton className="h-4 w-full rounded-2xl" />
							<Skeleton className="h-4 w-full rounded-2xl" />
							<Skeleton className="h-4 w-3/4 rounded-2xl" />
						</div>
					</div>
				</CardContent>
			</Card>
			<div className="w-full relative flex flex-col items-center">
				<div className="h-4" />
				<AnimatedList className="bg-component w-full col-span-1 row-span-1" />

				<Button
					variant="outline"
					size="icon"
					className="absolute rounded-full top-0 right-[45%]  z-20"
				>
					<Icons.Notification className="animate-notification-shake text-brand-9" />
				</Button>
			</div>
		</div>
	);
};
const Shipping = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				"w-full flex items-center flex-col transition-transform duration-300 ease-in-out",
				className,
			)}
		>
			<h2 className="font-freeman p-2 text-2xl">
				Choose the best shipping method for your product.
			</h2>
			<OrbitingShipping />
		</div>
	);
};
const Payment = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				"w-full flex items-center flex-col transition-transform duration-300 ease-in-out",
				className,
			)}
		>
			<h2 className="font-freeman p-2 text-2xl">
				Handle your payment with ease, we support multiple payment methods.,
			</h2>
			<OrbitingPayment />
		</div>
	);
};
const SalesChannels = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				"w-full flex items-center flex-col transition-transform duration-300 ease-in-out",
				className,
			)}
		>
			<h2 className="font-freeman p-2 pb-10 text-2xl">
				Use the marketing tools, social integrations, and sales channels you
				need to get your products in front of customers.
			</h2>
			<AnimatedBeamDemo />
		</div>
	);
};

const AnimatedToggleContent = () => {
	const [page, setPage] = useState("0");

	return (
		<div className="flex w-full h-full flex-col gap-20 lg:flex-row">
			<div className="flex w-full lg:w-5/12 items-center">
				<div className="w-full flex flex-col gap-4 sm:max-w-4xl">
					<p className="bg-gradient-to-b text-lg text-transparent text-start sm:text-center lg:text-start from-brand-6 to-brand-11 bg-clip-text ">
						New generational e-commerce platform
					</p>
					<span className="flex flex-row justify-start sm:justify-center lg:justify-start lg:flex-col gap-2">
						<h2 className="text-4xl font-freeman md:text-5xl prose text-black dark:text-white lg:tracking-tight">
							Everything you need to start selling
						</h2>
					</span>
					<p className="text-lg text-mauve-11 text-start sm:text-center lg:text-start lg:max-w-[400px]">
						Blazell revolutionizes your selling experience with powerful
						features that make selling online easier and genuinely enjoyable!
					</p>
					<ToggleGroup
						type="single"
						className="flex flex-col lg:items-start items-center gap-2"
						value={page.toString()}
						onValueChange={(value) => setPage(value)}
					>
						{features.map((feature, index) => (
							<ToggleGroupItem
								key={feature.title}
								value={index.toString()}
								className="w-full text-start flex justify-start md:w-[300px]"
							>
								{feature.title}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			</div>
			<div className="w-full lg:w-7/12">
				<div className="relative w-full h-full flex items-center">
					<RealTime
						className={cn("hidden lg:absolute", { grid: page === "0" })}
					/>
					<Shipping
						className={cn("hidden lg:absolute", { flex: page === "1" })}
					/>
					<Payment
						className={cn("hidden lg:absolute", { flex: page === "2" })}
					/>
					<SalesChannels
						className={cn("hidden lg:absolute", { flex: page === "3" })}
					/>
				</div>
			</div>
		</div>
	);
};
export { AnimatedToggleContent };
