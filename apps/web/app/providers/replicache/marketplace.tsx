import { useEffect } from "react";
import { Replicache } from "replicache";

import { useReplicache } from "~/zustand/replicache";
import { DashboardMutators } from "@blazell/replicache";

function MarketplaceReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	const setMarketplaceRep = useReplicache((state) => state.setMarketplaceRep);

	useEffect(() => {
		if (marketplaceRep) {
			return;
		}

		const r = new Replicache({
			name: "marketplace",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: DashboardMutators,
			pullInterval: null,
			//@ts-ignore
			puller: async (req) => {
				const result = await fetch("/api/pull/marketplace", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(req),
					credentials: "include",
				});

				return {
					response: result.status === 200 ? await result.json() : undefined,
					httpRequestInfo: {
						httpStatusCode: result.status,
						errorMessage: result.statusText,
					},
				};
			},
			pusher: async (req) => {
				const result = await fetch("/api/push/marketplace", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(req),
				});

				return {
					httpRequestInfo: {
						httpStatusCode: result.status,
						errorMessage: result.statusText,
					},
				};
			},
		});
		setMarketplaceRep(r);
	}, [marketplaceRep, setMarketplaceRep]);
	return <>{children}</>;
}

export { MarketplaceReplicacheProvider };
