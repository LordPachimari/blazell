import { useEffect } from "react";
import { Replicache } from "replicache";
import { useReplicache } from "~/zustand/replicache";
import { GlobalMutators } from "@blazell/replicache";
import { useRequestInfo } from "~/hooks/use-request-info";

export function GlobalReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const globalRep = useReplicache((state) => state.globalRep);
	const setGlobalRep = useReplicache((state) => state.setGlobalRep);
	const { userContext } = useRequestInfo();
	const { cartID, fakeAuthID, user } = userContext;

	useEffect(() => {
		if (globalRep) {
			return;
		}

		const r = new Replicache({
			name: "global",
			licenseKey: window.ENV.REPLICACHE_KEY,
			mutators: GlobalMutators,
			pullInterval: null,
			//@ts-ignore
			puller: async (req) => {
				const result = await fetch(`${window.ENV.WORKER_URL}/pull/global`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(cartID && { "x-cart-id": cartID }),
						...(fakeAuthID && { "x-fake-auth-id": fakeAuthID }),
						...(user?.id && { "x-user-id": user.id }),
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
				const result = await fetch(`${window.ENV.WORKER_URL}/push/global`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
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
	}, [globalRep, setGlobalRep, cartID, fakeAuthID, user]);

	return <>{children}</>;
}
