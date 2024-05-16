import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@pachi/ui/card";
import { ProductTypeCards } from "./wobble-cards";

function Features() {
	const features = [
		{
			title: "Dashboard",
			description: "Easily create a product with our blazingly fast dashboard",
			icon: <ShoppingBag />,
		},
		{
			title: "Analytics",
			description: "Analyze your sells with our powerful analytics tool.",
			icon: <ShoppingBag />,
		},
		{
			title: "Shipping",
			description: "Choose the best shipping method for your product.",
			icon: <ShoppingBag />,
		},
		{
			title: "Payment",
			description:
				"Handle your payment with ease, we support multiple payment methods.",
			icon: <ShoppingBag />,
		},
		{
			title: "Auction",
			description:
				"You can even auction your product! We made it fun and easy for you.",
			icon: <ShoppingBag />,
		},
		{
			title: "Community",
			description:
				"Our most powerful feature. Pachi provides easy reach which makes it easy to connect and build your community.",
			icon: <ShoppingBag />,
		},
	];

	return (
		<div className="flex flex-col items-center px-6 sm:px-14 ">
			<section className="w-full flex flex-col items-center">
				<h2 className="text-center text-4xl font-bold lg:text-5xl lg:tracking-tight">
					Everything you need to start selling
				</h2>
				<p className="mt-8 text-center text-lg text-mauve-11">
					Pachi comes with a lot of features that will help you to start selling
				</p>
				<ul className="mt-8 grid w-full gap-4 sm:grid-cols-2 md:w-10/12 md:grid-cols-3">
					{features.map((item, i) => (
						<Card
							key={item.title}
							className="aspect-square gap-4 rounded-xl shadow-sm hover:shadow-md border p-4"
						>
							<CardHeader>
								<h3 className="text-lg font-semibold">{item.title}</h3>
							</CardHeader>
							<CardContent />
							<CardFooter>
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
					What can you sell on Pachi?
				</h2>
				<ProductTypeCards />
			</section>
			<section className="w-full flex flex-col items-center mt-20">
				<h2 className="text-center text-4xl font-bold pt-20 lg:text-5xl lg:tracking-tight">
					More customizations
				</h2>
				<p className="mt-8 text-center text-lg text-mauve-11">
					With our <span className="font-bold">PRO</span> plan, you can
					customize your store appearance. Host your store on your own domain if
					you want!
				</p>
			</section>

			<section className="w-full flex flex-col items-center mt-20">
				<h2 className="text-center text-4xl font-bold pt-20 lg:text-5xl lg:tracking-tight">
					Creators selling on Pachi
				</h2>
			</section>
		</div>
	);
}

export { Features };
