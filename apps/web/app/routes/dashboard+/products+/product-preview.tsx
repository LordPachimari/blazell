import { generateReplicachePK } from "@blazell/utils";
import type { Product, Variant } from "@blazell/validators/client";
import { useSearchParams } from "@remix-run/react";
import { useCallback } from "react";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";

interface ProductPreviewProps {
	product: Product | null;
}
const ProductPreview = ({ product }: ProductPreviewProps) => {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const variants = ReplicacheStore.scan<Variant>(
		dashboardRep,
		`variant_${product?.id}`,
	);

	const defaultVariant = ReplicacheStore.getByPK<Variant>(
		dashboardRep,
		generateReplicachePK({
			prefix: "default_var",
			filterID: product?.id ?? "",
			id: product?.defaultVariantID ?? "",
		}),
	);
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
		? variants.find((v) => v.id === selectedVariantID) ?? null
		: null;
	return (
		<ProductOverview
			product={product}
			variants={variants}
			selectedVariant={selectedVariant}
			setVariantIDOrHandle={setSelectedVariantID}
			selectedVariantIDOrHandle={selectedVariantID}
			isDashboard={true}
			defaultVariant={defaultVariant}
		/>
	);
};
export { ProductPreview };
