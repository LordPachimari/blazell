import { Button } from "@blazell/ui/button";
import type { Product } from "@blazell/validators/client";
import { useSearchParams } from "@remix-run/react";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { useDashboardStore } from "~/zustand/store";

interface ProductPreviewProps {
	product: Product | undefined;
	setView: (value: "preview" | "input") => void;
}
const ProductPreview = ({ product, setView }: ProductPreviewProps) => {
	const variantMap = useDashboardStore((state) => state.variantMap);
	const variants = useDashboardStore((state) =>
		state.variants.filter(
			(v) => v.productID === product?.id && v.id !== product?.defaultVariantID,
		),
	);
	const defaultVariant = variantMap.get(product?.defaultVariantID ?? "");
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedVariantID = searchParams.get("variant") ?? undefined;
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const setSelectedVariantID = (id: string | undefined) => {
		setSearchParams((prev) => {
			const params = new URLSearchParams(prev);
			if (!id) {
				params.delete("variant");
				return params;
			}
			params.set("variant", id);
			return params;
		});
	};
	const selectedVariant = selectedVariantID
		? variants.find((v) => v.id === selectedVariantID)
		: undefined;
	return (
		<div className="w-full h-full relative">
			<ProductOverview
				product={product}
				variants={variants}
				selectedVariant={selectedVariant}
				setVariantIDOrHandle={setSelectedVariantID}
				selectedVariantIDOrHandle={selectedVariantID}
				isDashboard={true}
				defaultVariant={defaultVariant}
				setView={setView}
			/>
		</div>
	);
};
export { ProductPreview };
