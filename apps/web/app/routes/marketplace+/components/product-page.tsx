import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import type { Product, Variant } from "@blazell/validators/client";
import { ProductOverview } from "~/components/templates/product/product-overview";
import { useSearchParams } from "@remix-run/react";
import { generateReplicachePK } from "@blazell/utils";

interface ProductPageProps {
	product: Product | undefined | null;
	handle: string;
	cartID: string | undefined;
}
const ProductPage = ({
	product: serverProduct,
	handle,
	cartID,
}: ProductPageProps) => {
	return <></>;
};
export { ProductPage };
