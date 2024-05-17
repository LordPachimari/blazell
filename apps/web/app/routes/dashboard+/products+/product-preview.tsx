import type { Product, Variant } from "@pachi/validators/client";
import { useSearchParams } from "@remix-run/react";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";

interface ProductPreviewProps {
	product: Product | null | undefined;
}
const ProductPreview = ({ product }: ProductPreviewProps) => {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const variants = ReplicacheStore.scan<Variant>(
		dashboardRep,
		`variant_${product?.id}`,
	);
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedVariantID = searchParams.get("variant");
	const setSelectedVariantID = (id: string | null) => {
		setSearchParams((prev) => {
			if (!id) {
				prev.delete("variant");
				return prev;
			}
			prev.set("variant", id);
			return prev;
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
		/>
	);
};
export { ProductPreview };
