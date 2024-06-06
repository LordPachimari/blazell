import { useReplicache } from "~/zustand/replicache";
import { Products } from "./components/products";

export default function Marketplace() {
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);

	return (
		<main className="p-4 mt-14 lg:mt-0 flex justify-center px-0 lg:p-10 lg:px-0 0">
			<div className="max-w-[1320px]">
				<Products category="qwe" marketplaceRep={marketplaceRep} />
			</div>
		</main>
	);
}
