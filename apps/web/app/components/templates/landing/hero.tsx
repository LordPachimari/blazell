import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
export const headlines = [
	{ text: "businesses", gradient: "from-violet-400 to-violet-600" },
	{ text: "creators", gradient: "from-[#5B9EE9] to-[#2F74C0]" },
	{ text: "artists", gradient: "from-red-400 to-red-600" },
	{ text: "yourself!", gradient: "from-orange-400 to-orange-600" },
];
function Hero() {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
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
		<section className="flex h-screen w-screen flex-col items-center justify-center px-4 pt-10 sm:px-14 md:pt-8 lg:flex-row lg:pt-16">
			<div className="py-6 lg:order-1">
				<img
					src="/assets/hero.png"
					alt="Astronaut in the air"
					loading="eager"
				/>
			</div>
			<div>
				<h1 className="text-balance font-freeman text-center text-5xl font-bold lg:text-left lg:text-6xl lg:tracking-tight xl:text-7xl">
					Welcome to{" "}
					<span className="text-balance bg-gradient-to-b from-crimson-9 to-crimson-11 bg-clip-text text-5xl font-bold text-transparent lg:text-6xl lg:tracking-tight xl:text-7xl">
						Blazell
					</span>
				</h1>
				<span className="block text-balance  max-w-xl bg-clip-text text-lg text-mauve-11 my-6">
					Blazell is a global marketplace. We provide a platform for
					<span className="flex items-start gap-8 relative space-y-2 ">
						<AnimatePresence initial={false}>
							<span className="relative opacity-0">
								{headlines[currentIndex]!.text}
							</span>
							<motion.span
								key={currentIndex}
								initial={{ y: "-100%", opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ opacity: 0, transition: { duration: 0.2 } }}
								className={`not-sr-only absolute top-0 -bottom-4 block text-2xl font-freeman text-transparent bg-clip-text bg-gradient-to-br ${
									headlines[currentIndex]!.gradient
								}`}
							>
								{headlines[currentIndex]!.text}
							</motion.span>
						</AnimatePresence>

						<span>to sell products to the world!</span>
					</span>
				</span>
				<div className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
					<Link className={cn(buttonVariants())} to="/marketplace">
						Enter marketplace
					</Link>
				</div>
			</div>
		</section>
	);
}

export { Hero };
