import { Card, CardContent } from "@blazell/ui/card";
import { WobbleCard } from "../../wobble-card";
import Image from "~/components/molecules/image";

export function ProductTypeCards() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
			<WobbleCard containerClassName="relative col-span-1 bg-red-10 dark:bg-red-8 md:col-span-3 h-[300px]">
				<div className="max-w-sm">
					<h2 className="max-w-sm md:max-w-lg font-freeman  text-left text-balance text-4xl font-semibold tracking-[-0.015em] text-white">
						Physical products
					</h2>
					<p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
						Products can range from clothing to electronics and food.
					</p>
					<Card className="hidden lg:block absolute right-10 top-3 rotate-3 p-2">
						<CardContent className="overflow-hidden">
							<Image
								src="/assets/product-3.jpg"
								className=" w-40 object-contain"
							/>
						</CardContent>
					</Card>
					<Card className="block absolute right-2 top-48 rotate-45 lg:right-48 lg:top-3  p-2">
						<CardContent className="overflow-hidden">
							<Image
								src="/assets/product-2.jpg"
								className=" w-40 object-contain"
							/>
						</CardContent>
					</Card>
					<Card className="hidden lg:block absolute right-80 top-3 -rotate-2 p-2">
						<CardContent className="overflow-hidden">
							<Image
								src="/assets/product-1.jpg"
								className=" w-40 object-contain"
							/>
						</CardContent>
					</Card>
				</div>
			</WobbleCard>
			<WobbleCard
				containerClassName="col-span-1 md:col-span-2 lg:col-span-2 h-full bg-iris-9 dark:bg-iris-7 h-[300px]"
				className=""
			>
				<div className="max-w-xs">
					<h2 className="text-left text-balance text-4xl font-freeman font-semibold tracking-[-0.015em] text-white">
						Digital products
					</h2>
					<p className="mt-4 text-left  text-base/6 text-neutral-200">
						Sell you digital courses, ebooks, software, and many more .
					</p>
					<Card className="hidden lg:block absolute right-10 bottom-3 p-2 rotate-3">
						<CardContent className="overflow-hidden">
							<Image
								src="/assets/product-5.jpg"
								className=" w-40 object-contain"
							/>
						</CardContent>
					</Card>
					<Card className="hidden lg:block absolute right-40 bottom-3 -rotate-2 p-2">
						<CardContent className="overflow-hidden">
							<Image
								src="/assets/product-4.jpg"
								className=" w-40 object-contain"
							/>
						</CardContent>
					</Card>
				</div>
			</WobbleCard>
			<WobbleCard containerClassName="col-span-1 h-[300px] bg-jade-10 dark:bg-jade-7">
				<h2 className="max-w-80  text-left text-balance text-4xl font-freeman font-semibold tracking-[-0.015em] text-white">
					Digital giftcards.
				</h2>
				<p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
					Blazell allows you to create custom giftcards for your community.
				</p>
			</WobbleCard>
		</div>
	);
}
