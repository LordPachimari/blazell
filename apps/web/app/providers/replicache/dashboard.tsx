import { useEffect } from "react";
import { Replicache } from "replicache";

import { DashboardMutators } from "@pachi/core";

import { useAuth } from "@clerk/remix";
import type { User } from "@pachi/validators/client";
import { useReplicache } from "~/zustand/replicache";
import { ReplicacheStore } from "~/replicache/store";

function DashboardReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { dashboardRep, userRep, setDashboardRep } = useReplicache();
	const users = ReplicacheStore.scan<User>(userRep, "user");
	const user = users?.[0];
	const { getToken } = useAuth();

	useEffect(() => {
		if (dashboardRep || !user) {
			return;
		}

		const r = new Replicache({
			name: `dashboard_${user.id}`,
			//@ts-ignore
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
				const result = await fetch(
					//@ts-ignore
					`${window.ENV.WORKER_URL}/pull/dashboard`,
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
					//@ts-ignore
					`${window.ENV.WORKER_URL}/push/dashboard`,
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
		setDashboardRep(r);
	}, [user, dashboardRep, setDashboardRep, getToken]);
	return <>{children}</>;
}

export { DashboardReplicacheProvider };
