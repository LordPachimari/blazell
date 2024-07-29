import { DashboardMutators } from "@blazell/replicache";
import { useEffect } from "react";
import { Replicache } from "replicache";
import { useReplicache } from "~/zustand/replicache";

function DashboardReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const setDashboardRep = useReplicache((state) => state.setDashboardRep);

	useEffect(() => {
		if (dashboardRep) {
			return;
		}

		const r = new Replicache({
			name: "dashboard",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: DashboardMutators,
			pullInterval: null,

			//@ts-ignore
			puller: async (req) => {
				const result = await fetch(`${window.ENV.WORKER_URL}/pull/dashboard`, {
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
				const result = await fetch(`${window.ENV.WORKER_URL}/push/dashboard`, {
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
		setDashboardRep(r);
	}, [dashboardRep, setDashboardRep]);
	return <>{children}</>;
}

export { DashboardReplicacheProvider };
