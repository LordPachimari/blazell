import { Card, CardContent } from "@blazell/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@blazell/ui/toggle-group";
import type { Theme } from "@blazell/validators";
import { motion } from "framer-motion";
import React, { useState } from "react";
import FadeRight from "~/components/molecules/fade-right";
import FadeUp from "~/components/molecules/fade-up";
import Image from "~/components/molecules/image";
import { useWindowSize } from "~/hooks/use-window-size";
import { ProductTypeCards } from "./wobble-cards";
type Feature = {
	title: string;
	description: string;
};

const features = [
	{
		title: "Real-time",
		description:
			"Host interactive live auctions, track incoming orders the instant they arrive, and schedule merch drops with real-time customer notifications. Keep your sales blazing!",
	},
	{
		title: "Shipping",
		description: "Choose the best shipping method for your product.",
	},
	{
		title: "Payment",
		description:
			"Handle your payment with ease, we support multiple payment methods.",
	},
	{
		title: "Sales channels",
		description:
			"Sell online, in person, and around the world with the marketing tools, social integrations, and sales channels you need to get your products in front of customers.",
	},
] satisfies Feature[];

function Features({ theme }: { theme: Theme }) {
	const [featureValue, setFeatureValue] = React.useState<string>(
		features[0]!.title,
	);
	console.log("theme", theme);

	return (
		<div className="flex flex-col items-center px-4 ">
			<section className="py-20 w-full flex-col sm:flex-row items-center h-[700px]">
				<FadeRight delay={0.1}>
					<div className="w-full flex flex-col md:px-10 gap-4 lg:px-24">
						<p className="bg-gradient-to-b text-lg text-transparent from-crimson-9 to-crimson-11 bg-clip-text ">
							New generational e-commerce platform
						</p>
						<span>
							<h2 className="text-4xl font-freeman md:text-5xl prose text-black dark:text-white lg:tracking-tight">
								Everything you need
							</h2>
							<h2 className="text-4xl font-freeman md:text-5xl prose text-black dark:text-white lg:tracking-tight">
								to start selling
							</h2>
						</span>
						<p className="text-lg text-mauve-11 max-w-[400px]">
							Blazell revolutionizes your selling experience with powerful
							features that make selling online easier and genuinely enjoyable!
						</p>
						<ToggleGroup
							type="single"
							className="flex flex-col items-start gap-2"
							value={featureValue}
							onValueChange={(value) => setFeatureValue(value)}
						>
							{features.map((feature) => (
								<ToggleGroupItem
									key={feature.title}
									value={feature.title}
									className="w-full text-start flex justify-start md:w-[300px]"
								>
									{feature.title}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</div>
				</FadeRight>
				<div className="w-full" />
			</section>
			<section className="w-full py-20 flex flex-col items-center">
				<FadeUp delay={0.1}>
					<h2 className="text-center text-4xl prose text-black dark:text-white font-freeman py-20 lg:text-5xl lg:tracking-tight">
						What can you sell on Blazell?
					</h2>
				</FadeUp>
				<FadeUp delay={0.1} distance={80}>
					<ProductTypeCards />
				</FadeUp>
			</section>
			<section className="w-full flex flex-col gap-10 items-center">
				<FadeUp delay={0.1}>
					<h2 className="text-center font-freeman text-4xl font-bold pt-20 lg:text-5xl lg:tracking-tight">
						More customizations
					</h2>
				</FadeUp>
				<FadeUp delay={0.1}>
					<p className="text-center text-lg text-mauve-11">
						With our <span className="font-bold">PRO</span> plan, you can
						customize your store appearance. You can even create your own
						domain!
					</p>
				</FadeUp>
				<FadeUp delay={0.1} distance={80}>
					<Image
						src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa3b9c0d90d1a4dcbaa50c029e630f922"
						className="w-full lg:w-[1200px] rounded-lg"
					/>
				</FadeUp>
			</section>

			<section className="w-full flex flex-col items-center mt-20">
				<FadeUp delay={0.1}>
					<h2 className="text-center font-freeman text-4xl font-bold pt-20 lg:text-5xl lg:tracking-tight">
						See who is selling on Blazell
					</h2>
				</FadeUp>
				<div className="py-20">
					<CardGrid />
				</div>
			</section>
		</div>
	);
}
const ExpandingCard = ({ id }: { id: number }) => {
	const [expanded, setExpanded] = useState(false);
	const windowSize = useWindowSize(100);

	return (
		<>
			<motion.div
				onClick={() => {
					console.log("clicked");
					setExpanded((prev) => !prev);
				}}
				animate={{ width: expanded || windowSize.width < 1024 ? 400 : 200 }} // 72px = 18rem = 288px, 30px = 7.5rem = 120px
				transition={{ duration: 0.2, ease: "easeInOut" }}
				className="hidden sm:block cursor-pointer"
			>
				<FadeUp delay={0.2 * id} distance={80}>
					<Card>
						<CardContent className="h-[500px] min-w-[200px] w-full" />
					</Card>
				</FadeUp>
			</motion.div>
			<Card className="sm:hidden w-full">
				<CardContent className="h-[500px] w-full min-w-[200px]" />
			</Card>
		</>
	);
};
const CardGrid = () => {
	return (
		<motion.div className="flex gap-2 justify-center flex-wrap w-full" layout>
			{[1, 2, 3, 4].map((id) => (
				<ExpandingCard key={id} id={id} />
			))}
		</motion.div>
	);
};

export { Features };
