import type { Product } from "@blazell/validators/client";
import PriceLabel from "~/components/molecules/price-label";

interface GeneralInfoProps {
	product: Product | null | undefined;
}

function GeneralInfo({ product }: GeneralInfoProps) {
	return (
		<section className="flex flex-col  ">
			<span className="flex justify-between">
				<h1 className="font-semibold uppercase text-2xl">{`${product?.defaultVariant.title}`}</h1>
				<PriceLabel
					title={product?.defaultVariant.prices?.[0]?.currencyCode ?? "USD"}
					amount={product?.defaultVariant.prices?.[0]?.amount ?? 0}
					currencyCode={
						product?.defaultVariant.prices?.[0]?.currencyCode ?? "USD"
					}
				/>
			</span>

			<p className="text-base text-mauve-11 py-4 text-balance">
				{product?.description}
			</p>
		</section>
	);
}

export { GeneralInfo };
