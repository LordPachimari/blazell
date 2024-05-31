import type { Product, Variant } from "@blazell/validators/client";
import PriceLabel from "~/components/molecules/price-label";

interface GeneralInfoProps {
	product: Product | null | undefined;
	defaultVariant: Variant | undefined | null;
}

function GeneralInfo({ product, defaultVariant }: GeneralInfoProps) {
	return (
		<section className="flex flex-col ">
			<span className="flex justify-between">
				<h1 className="font-semibold uppercase text-2xl">{`${
					defaultVariant?.title ?? "Untitled"
				}`}</h1>
				<PriceLabel
					title={defaultVariant?.prices?.[0]?.currencyCode ?? "USD"}
					amount={defaultVariant?.prices?.[0]?.amount ?? 0}
					currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "USD"}
				/>
			</span>

			<p className="text-base text-mauve-11 py-4 text-balance">
				{product?.description}
			</p>
		</section>
	);
}

export { GeneralInfo };
