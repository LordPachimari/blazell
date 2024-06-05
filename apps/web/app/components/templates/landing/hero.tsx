import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Link } from "@remix-run/react";
import { WordRotate } from "@blazell/ui/word-rotate";
function Hero() {
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
				<p className="my-8 max-w-xl text-center text-xl text-mauve-11 text-mauve-600 lg:text-left">
					Blazell is a global marketplace. We provide a platform for{" "}
					<span className="flex">
						<WordRotate
							words={["content-creators", "businesses", "you!"]}
							className="font-freeman text-crimson-9 text-2xl "
						/>{" "}
						<p className="py-3 pl-2">to sell products to the world!</p>
					</span>
				</p>
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
