import { useEffect } from "react";
import { Replicache } from "replicache";

import { useAuth } from "@clerk/remix";
import { useReplicache } from "~/zustand/replicache";
import { DashboardMutators } from "@blazell/replicache";

function MarketplaceReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	const setMarketplaceRep = useReplicache((state) => state.setMarketplaceRep);
	const { getToken } = useAuth();

	useEffect(() => {
		if (marketplaceRep) {
			return;
		}

		const r = new Replicache({
			name: "marketplace",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: DashboardMutators,
			pullInterval: null,
			indexes: {
				categoryPK: {
					jsonPointer: "/categoryPK",
					allowEmpty: true,
				},
			},

			//@ts-ignore
			puller: async (req) => {
				const start = performance.now();
				const token = await getToken();
				const result = await fetch(
					`${window.ENV.WORKER_URL}/pull/marketplace`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(req),
						credentials: "include",
					},
				);
				const end = performance.now();
				console.log("pull time", end - start);

				return {
					response: result.status === 200 ? await result.json() : undefined,
					httpRequestInfo: {
						httpStatusCode: result.status,
						errorMessage: result.statusText,
					},
				};
			},
			pusher: async (req) => {
				const start = performance.now();
				const token = await getToken();
				const result = await fetch(
					`${window.ENV.WORKER_URL}/push/marketplace`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(req),
					},
				);

				const end = performance.now();
				console.log("pull time", end - start);

				return {
					httpRequestInfo: {
						httpStatusCode: result.status,
						errorMessage: result.statusText,
					},
				};
			},
		});
		setMarketplaceRep(r);
	}, [marketplaceRep, setMarketplaceRep, getToken]);
	return <>{children}</>;
}

export { MarketplaceReplicacheProvider };
