import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
export const headlines = [
	{ text: "businesses", gradient: "from-violet-400 to-violet-600" },
	{ text: "creators", gradient: "from-[#5B9EE9] to-[#2F74C0]" },
	{ text: "artists", gradient: "from-red-400 to-red-600" },
	{ text: "yourself!", gradient: "from-orange-400 to-orange-600" },
];
function Hero() {
	const [_, setCurrentIndex] = useState<number>(0);
	useEffect(() => {
		const id = setInterval(
			() => setCurrentIndex((id) => (id === headlines.length - 1 ? 0 : id + 1)),
			2500,
		);
		return () => {
			clearInterval(id);
		};
	}, []);
	return (
		<section className="flex h-screen w-full flex-col items-center justify-center px-6 pt-10 md:pt-8 md:px-20 lg:flex-row lg:pt-16">
			<div className="flex flex-col gap-4 w-full items-center">
				<h1
					style={{ animationDelay: "0.20s", animationFillMode: "both" }}
					className="animate-fade-up text-balance prose font-freeman text-center text-black dark:text-white text-5xl font-bold lg:text-left lg:tracking-tight"
				>
					Making Commerce
				</h1>
				<h1
					style={{ animationDelay: "0.20s", animationFillMode: "both" }}
					className="animate-fade-up text-balance prose font-freeman text-center text-black dark:text-white text-5xl font-bold lg:text-left lg:tracking-tight"
				>
					Accessible for Everyone
				</h1>
				<span
					style={{ animationDelay: "0.30s", animationFillMode: "both" }}
					className="animate-fade-up block text-wrap max-w-xl bg-clip-text prose text-lg my-6 font-medium text-mauve-11"
				>
					We provide a e-commerce platform for businesses, creators, and artists
					for free. Start selling your products and services to a global
					audience today.
				</span>
				<div className="mt-6 flex w-full flex-col justify-center items-center gap-3 sm:flex-row ">
					<Link
						className={cn(
							buttonVariants({ size: "lg" }),
							"h-14 animate-fade-up",
						)}
						to="/marketplace"
						prefetch="intent"
						style={{ animationDelay: "0.40s", animationFillMode: "both" }}
					>
						Enter marketplace
					</Link>
				</div>
			</div>
		</section>
	);
}
export { Hero };
