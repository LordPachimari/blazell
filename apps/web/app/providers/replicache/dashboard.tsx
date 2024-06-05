import { DashboardMutators } from "@blazell/replicache";
import { useAuth } from "@clerk/remix";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Replicache } from "replicache";
import type { RootLoaderData } from "~/root";
import { useReplicache } from "~/zustand/replicache";

function DashboardReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const setDashboardRep = useReplicache((state) => state.setDashboardRep);
	const { getToken } = useAuth();

	useEffect(() => {
		if (dashboardRep) {
			return;
		}

		const r = new Replicache({
			name: "dashboard",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: DashboardMutators,
			pullInterval: null,
			indexes: {
				id: {
					jsonPointer: "/id",
					allowEmpty: true,
				},
			},

			//@ts-ignore
			puller: async (req) => {
				const start = performance.now();
				const token = await getToken();
				const result = await fetch(`${window.ENV.WORKER_URL}/pull/dashboard`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(req),
					credentials: "include",
				});
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
				const result = await fetch(`${window.ENV.WORKER_URL}/push/dashboard`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(req),
				});

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
		setDashboardRep(r);
	}, [dashboardRep, setDashboardRep, getToken]);
	return <>{children}</>;
}

export { DashboardReplicacheProvider };
