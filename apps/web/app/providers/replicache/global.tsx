import { useEffect } from "react";
import { Replicache } from "replicache";
import { useAuth } from "@clerk/remix";
import { useReplicache } from "~/zustand/replicache";
import { GlobalMutators } from "@blazell/replicache";

export function GlobalReplicacheProvider({
	children,
	cartID,
	fakeAuthID,
}: Readonly<{
	children: React.ReactNode;
	cartID: string | undefined;
	fakeAuthID?: string;
}>) {
	const globalRep = useReplicache((state) => state.globalRep);
	const setGlobalRep = useReplicache((state) => state.setGlobalRep);

	const { getToken } = useAuth();

	useEffect(() => {
		if (globalRep) {
			return;
		}

		const r = new Replicache({
			name: "user",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: GlobalMutators,
			pullInterval: null,
			indexes: {
				id: {
					jsonPointer: "/id",
					allowEmpty: true,
				},
			},
			//@ts-ignore
			puller: async (req) => {
				const token = await getToken();
				const result = await fetch(`${window.ENV.WORKER_URL}/pull/global`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
						...(cartID && { "x-cart-id": cartID }),
						...(fakeAuthID && { "x-fake-auth-id": fakeAuthID }),
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
				const token = await getToken();
				const result = await fetch(`${window.ENV.WORKER_URL}/push/global`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
						...(fakeAuthID && { "x-fake-auth-id": fakeAuthID }),
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
		setGlobalRep(r);
	}, [globalRep, setGlobalRep, getToken, cartID, fakeAuthID]);

	return <>{children}</>;
}
