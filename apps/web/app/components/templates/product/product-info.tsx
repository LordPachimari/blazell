import { Icons } from "@blazell/ui/icons";
import type { PublishedVariant } from "@blazell/validators";
import type { Variant } from "@blazell/validators/client";
import Price from "~/components/molecules/price";

interface GeneralInfoProps {
	defaultVariant: Variant | PublishedVariant | undefined | null;
}

function GeneralInfo({ defaultVariant }: GeneralInfoProps) {
	return (
		<section className="flex flex-col ">
			<span className="flex justify-between">
				<h1 className="font-semibold text-2xl">{`${
					defaultVariant?.title ?? "Untitled"
				}`}</h1>
			</span>
			<Reviews />

			<Price
				className="text-3xl py-2 font-black"
				amount={defaultVariant?.prices?.[0]?.amount ?? 0}
				currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "USD"}
			/>
		</section>
	);
}
function Reviews() {
	return (
		<div className="flex gap-2 py-4 items-center">
			<span className="flex">
				{Array.from({ length: 5 }, (_, index) => (
					<Icons.Star key={index} fill="var(--yellow-9)" strokeWidth={0} />
				))}
			</span>

			<p className="text-mauve-11 text-sm">{"(5.0)"}</p>
			<p className="underline cursor-pointer text-sm">345 reviews</p>
		</div>
	);
}

export { GeneralInfo };
