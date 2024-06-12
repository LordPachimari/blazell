import { WobbleCard } from "../../wobble-card";

export function ProductTypeCards() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
			<WobbleCard containerClassName="col-span-1 bg-ruby-9 dark:bg-crimson-8 lg:col-span-3 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
				<div className="max-w-sm">
					<h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
						Physical products
					</h2>
					<p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
						Products can range from clothing, electronics, and even food.
					</p>
				</div>
			</WobbleCard>
			<WobbleCard
				containerClassName="col-span-1 lg:col-span-2 h-full bg-iris-9 dark:bg-iris-7 min-h-[500px] lg:min-h-[300px]"
				className=""
			>
				<div className="max-w-xs">
					<h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
						Digital products
					</h2>
					<p className="mt-4 text-left  text-base/6 text-neutral-200">
						Sell you digital courses, ebooks, software, and many more .
					</p>
				</div>
			</WobbleCard>
			<WobbleCard containerClassName="col-span-1 min-h-[300px] bg-jade-10 dark:bg-jade-7">
				<h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
					Digital giftcards.
				</h2>
				<p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
					Blazell allows you to create custom giftcards for your community.
				</p>
			</WobbleCard>
		</div>
	);
}
