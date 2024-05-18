"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cn } from "@pachi/ui";
import { Card, CardContent, CardFooter, CardTitle } from "@pachi/ui/card";
import type { Store } from "@pachi/validators/client";
import { useNavigate } from "@remix-run/react";
import { Image } from "~/components/image";
import { ReplicacheStore } from "~/replicache/store";
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
						<Card className="p-4 text-center shadow-md cursor-pointer hover:shadow-xl aspect-square max-w-[500px]">
							<CardContent className="p-0">
								<Image
									src={"https://github.com/shadcn.png"}
									alt={_store.name}
									width={500}
									height={500}
									className="rounded-xl"
								/>
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
