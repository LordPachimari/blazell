import { Card, CardContent, CardFooter } from "@blazell/ui/card";
import type { Theme } from "@blazell/validators";
import { BadgeDollarSign, BarChartBig, Settings, Truck } from "lucide-react";
import { ProductTypeCards } from "./wobble-cards";
type Feature = {
	title: string;
	description: string;
	component: React.ReactNode;
};
function Features({ theme }: { theme: Theme }) {
	const features = [
		{
			title: "Organize",
			description:
				"Organize auctions, schedule merch drops, and see your income grow in real-time.",
			component: (
				<div>
					{theme === "dark" ? (
						<img
							src="/assets/demo-1-dark.png"
							alt="Demo2"
							className="object-fill rounded-lg"
						/>
					) : (
						<img
							src="/assets/demo-1.png"
							alt="Demo1"
							className="object-fill rounded-lg"
						/>
					)}
				</div>
			),
		},
		{
			title: "Analytics",
			description: "Analyze your sells with our powerful analytics tool.",
			component: (
				<div className="flex justify-center items-center h-full">
					<BarChartBig size={70} className="text-crimson-9" />
				</div>
			),
		},
		{
			title: "Shipping",
			description: "Choose the best shipping method for your product.",
			component: (
				<div className="flex justify-center items-center h-full">
					<Truck size={70} className="text-crimson-9" />
				</div>
			),
		},
		{
			title: "Payment",
			description:
				"Handle your payment with ease, we support multiple payment methods.",
			component: (
				<div className="flex justify-center items-center h-full">
					<BadgeDollarSign size={70} className="text-crimson-9" />
				</div>
			),
		},
		{
			title: "API",
			description: "Use our rich API to build your own store.",
			component: (
				<div className="flex justify-center items-center h-full">
					<Settings size={70} className="text-crimson-9" />
				</div>
			),
		},
	] satisfies Feature[];

	return (
		<div className="flex flex-col items-center pt-10 px-4">
			<section className="w-full flex flex-col items-center">
				<h2 className="text-center text-4xl font-bold lg:text-5xl lg:tracking-tight">
					Everything you need to start selling
				</h2>
				<p className="mt-8 text-center text-lg text-mauve-11">
					Blazell comes with a lot of features that will help you to start
					selling
				</p>
				<ul className="mt-8 grid w-full gap-4  sm:grid-cols-2 md:w-10/12 xl:grid-cols-3">
					{features.map((item) => (
						<Card
							key={item.title}
							className="aspect-square h-fit relative cursor-pointer hover:scale-105 transition-all duration-100 ease-out gap-4 rounded-xl shadow-sm hover:shadow-md border p-4"
						>
							<CardContent className="h-3/4">{item.component}</CardContent>
							<CardFooter className="py-4 h-[120px]">
								<h3 className="text-lg font-semibold">{item.title}</h3>
								<p className="mt-2 leading-relaxed text-mauve-11">
									{item.description}
								</p>
							</CardFooter>
						</Card>
					))}
				</ul>
			</section>
			<section className="w-full flex flex-col items-center mt-20">
				<h2 className="text-center text-4xl font-bold py-20 lg:text-5xl lg:tracking-tight">
					What can you sell on Blazell?
				</h2>
				<ProductTypeCards />
			</section>
			<section className="w-full flex flex-col items-center mt-20">
				<h2 className="text-center text-4xl font-bold pt-20 lg:text-5xl lg:tracking-tight">
					More customizations
				</h2>
				<p className="mt-8 text-center text-lg text-mauve-11">
					With our <span className="font-bold">PRO</span> plan, you can
					customize your store appearance. You can even create your own domain!
				</p>
			</section>

			<section className="w-full flex flex-col items-center mt-20">
				<h2 className="text-center text-4xl font-bold pt-20 lg:text-5xl lg:tracking-tight">
					See who is selling on Blazell
				</h2>
			</section>
		</div>
	);
}

export { Features };
