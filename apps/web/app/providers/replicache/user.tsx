import { useEffect } from "react";
import { Replicache } from "replicache";

import { UserMutators } from "@pachi/core";

import { useAuth } from "@clerk/remix";
import { useReplicache } from "~/zustand/replicache";

export default function UserReplicacheProvider({
	children,
	cartID,
}: Readonly<{
	children: React.ReactNode;
	cartID: string | undefined;
}>) {
	const userRep = useReplicache((state) => state.userRep);
	const setUserRep = useReplicache((state) => state.setUserRep);

	const { getToken } = useAuth();

	useEffect(() => {
		if (userRep) {
			return;
		}

		const r = new Replicache({
			name: "user",
			//@ts-ignore
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: UserMutators,
			pullInterval: null,
			indexes: {
				id: {
					jsonPointer: "/id",
					allowEmpty: true,
				},
			},
			//@ts-ignore
			puller: async (req) => {
				const now = performance.now();
				const token = await getToken();
				const result = await fetch(
					//@ts-ignore
					`${window.ENV.WORKER_URL}/pull/user`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
							...(cartID && { "x-cart-id": cartID }),
						},
						body: JSON.stringify(req),
						credentials: "include",
					},
				);
				const end = performance.now();
				console.log("pull time", end - now);

				return {
					response: result.status === 200 ? await result.json() : undefined,
					httpRequestInfo: {
						httpStatusCode: result.status,
						errorMessage: result.statusText,
					},
				};
			},
			pusher: async (req) => {
				const now = performance.now();
				const token = await getToken();
				const result = await fetch(
					//@ts-ignore
					`${window.ENV.WORKER_URL}/push/user`,
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
				console.log("push time", end - now);
				return {
					httpRequestInfo: {
						httpStatusCode: result.status,
						errorMessage: result.statusText,
					},
				};
			},
		});
		setUserRep(r);
	}, [userRep, setUserRep, getToken, cartID]);

	return <>{children}</>;
}
