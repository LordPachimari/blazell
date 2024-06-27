import { cn } from "@blazell/ui";
import { Avatar, AvatarImage } from "@blazell/ui/avatar";
import { Card, CardContent } from "@blazell/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";
import FadeUp from "~/components/molecules/fade-up";
import Image from "~/components/molecules/image";
import { AnimatedToggleContent } from "./animated-toggle-content";
import { ProductTypeCards } from "./wobble-cards";

function Features() {
	return (
		<div className="flex flex-col items-center pt-10 px-6 sm:px-10 w-full">
			<section className="w-full flex min-h-screen flex-col sm:flex-row justify-center items-center max-w-[1300px]">
				<AnimatedToggleContent />
			</section>
			<section className="w-full flex flex-col items-center">
				<h2 className="w-full text-center text-4xl text-black dark:text-white font-freeman py-20 lg:text-5xl lg:tracking-tight">
					What can you sell on Blazell?
				</h2>
				<ProductTypeCards />
			</section>
			<section className="w-full flex  flex-col gap-10 items-center">
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
				<FadeUp
					delay={0.1}
					distance={80}
					className="w-full flex justify-center"
				>
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
const ExpandingCard = ({
	index,
	description,
	storeName,
	imageSrc,
	logoSrc,
	expanded,
	setExpanded,
}: {
	index: number;
	storeName: string;
	description: string;
	imageSrc: string;
	logoSrc: string;
	expanded: boolean;
	setExpanded: (id: string) => void;
}) => {
	return (
		<>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={() => {
					setExpanded(storeName);
				}}
				className={cn(
					"hidden sm:block w-full max-w-[450px] md:w-[200px] cursor-pointer transition-all ease-in-out duration-300 hover:scale-105 transform-gpu",
					{ "md:w-[400px]": expanded },
				)}
			>
				<FadeUp delay={0.2 * index} distance={80}>
					<Card className="p-2 min-w-[200px]">
						<CardContent
							className={cn(
								"h-[500px] min-w-[150px] w-[calc(100%)] brightness-100 md:brightness-50",
								{ "md:brightness-100": expanded },
							)}
						>
							<CardContent className="relative h-[500px] w-full min-w-[150px] overflow-hidden rounded-lg">
								<Image
									src={imageSrc}
									className="object-cover h-full overflow-hidden"
									fit="cover"
								/>
								<Avatar className="h-16 w-16 absolute border-none border-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
									<AvatarImage src={logoSrc} />
								</Avatar>
								<div
									className={cn(
										"z-10 bottom-0 p-2 absolute text-white md:opacity-0 transition-all ease-in-out duration-300",
										{ "md:opacity-100": expanded },
									)}
								>
									<h2 className="font-freeman text-lg">{storeName}</h2>
									<p className="line-clamp-3 text-ellipsis">{description}</p>
								</div>
							</CardContent>
						</CardContent>
					</Card>
				</FadeUp>
			</div>
			<Card className="sm:hidden w-full p-2">
				<CardContent className="relative h-[500px] w-full min-w-[150px] overflow-hidden rounded-lg">
					<Image
						src={imageSrc}
						className="object-cover h-full overflow-hidden"
						fit="cover"
					/>
					<Avatar className="h-16 w-16 absolute border-none border-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
						<AvatarImage src={logoSrc} />
					</Avatar>
					<div
						className={cn(
							"z-10 bottom-0 p-2 absolute text-white transition-all ease-in-out duration-300",
						)}
					>
						<h2 className="font-freeman text-lg">{storeName}</h2>
						<p className="line-clamp-3 text-ellipsis">{description}</p>
					</div>
				</CardContent>
			</Card>
		</>
	);
};

const stores = [
	{
		title: "MrBeast",
		logoSrc: "/assets/mrbeast-1.jpg",
		imageSrc: "/assets/mrbeast-1.jpg",
		description:
			"MrBeast is a YouTuber known for his expensive stunts and philanthropy. He has over 100 million subscribers on YouTube.",
	},
	{
		title: "MKBHD",
		logoSrc: "/assets/mkbhd-logo.jpg",
		imageSrc: "/assets/mkb-1.webp",
		description:
			"MKBHD is a YouTuber known for his tech reviews and unboxings. He has over 15 million subscribers on YouTube.",
	},
	{
		title: "Terminal",
		logoSrc: "/assets/terminal-2.jpg",
		imageSrc: "/assets/terminal-2.jpg",
		description:
			"Terminal is a company that sells coffee beans and coffee accessories. ",
	},
	{
		title: "Mcdonalds",
		logoSrc: "/assets/mcdonalds.jpg",
		imageSrc: "/assets/mcdonalds-2.jpg",
		description:
			"Mcdonalds is a fast food chain that sells burgers, fries, and other fast food items.",
	},
];
const CardGrid = () => {
	const [expanded, setExpanded] = useState(stores[0]?.title);
	return (
		<motion.div className="flex gap-4 justify-center flex-wrap w-full" layout>
			{stores.map((store, index) => (
				<ExpandingCard
					key={store.title}
					index={index}
					description={store.description}
					storeName={store.title}
					imageSrc={store.imageSrc}
					logoSrc={store.logoSrc}
					expanded={expanded === store.title}
					setExpanded={setExpanded}
				/>
			))}
		</motion.div>
	);
};

export { Features };
