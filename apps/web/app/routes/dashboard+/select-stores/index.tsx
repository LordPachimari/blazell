import { cn } from "@blazell/ui";
import { Card, CardContent, CardFooter, CardTitle } from "@blazell/ui/card";
import type { Store } from "@blazell/validators/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useNavigate } from "@remix-run/react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { ReplicacheStore } from "~/replicache/store";
import { toImageURL } from "~/utils/helpers";
import { useReplicache } from "~/zustand/replicache";

export default function SelectStores() {
	const rep = useReplicache((state) => state.dashboardRep);
	const stores = ReplicacheStore.scan<Store>(rep, "store");
	const [parent] = useAutoAnimate({ duration: 100 });
	const navigate = useNavigate();

	return (
		<>
			<section className="pt-20 w-full flex justify-center md:py-10">
				<h1 className="font-bold text-4xl">Your Stores</h1>
			</section>
			<ul
				ref={parent}
				className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", {
					"md:grid-cols-1 lg:grid-cols-1": stores.length === 1,
					"lg:grid-cols-2": stores.length === 2,
				})}
			>
				{stores.map((_store, index) => (
					<li
						key={`${_store.id}_${index}`}
						className="flex justify-center items-center"
						onClick={async () => {
							await rep?.mutate.setActiveStoreID({
								id: _store.id,
							});
							navigate("/dashboard/store");
						}}
						onKeyDown={async () => {
							await rep?.mutate.setActiveStoreID({
								id: _store.id,
							});
							navigate("/dashboard/store");
						}}
					>
						<Card className="p-4 text-center flex justify-center items-center shadow-md cursor-pointer hover:shadow-xl aspect-square max-w-[500px]">
							<CardContent className="p-0">
								{!_store.storeImage ? (
									<ImagePlaceholder />
								) : _store.storeImage.uploaded ? (
									<Image
										src={_store.storeImage.url}
										alt={_store.name}
										className="rounded-xl"
									/>
								) : (
									<img
										src={toImageURL(
											_store.storeImage.base64,
											_store.storeImage.fileType,
										)}
										alt={_store.name}
										className="rounded-xl"
									/>
								)}
							</CardContent>
							<CardFooter className="flex flex-row items-center justify-between fill-current h-14 p-0 pt-4">
								<span className="flex flex-col items-start">
									<CardTitle className="text-balance">{_store.name}</CardTitle>
								</span>
							</CardFooter>
						</Card>
					</li>
				))}
			</ul>
		</>
	);
}
