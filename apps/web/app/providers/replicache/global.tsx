import { GlobalMutators } from "@blazell/replicache";
import { useEffect } from "react";
import { Replicache } from "replicache";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useReplicache } from "~/zustand/replicache";

export function GlobalReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const globalRep = useReplicache((state) => state.globalRep);
	const setGlobalRep = useReplicache((state) => state.setGlobalRep);
	const { userContext } = useRequestInfo();
	const { cartID, authUser } = userContext;

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
				const result = await fetch("/api/pull/global", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						...(cartID && { "x-cart-id": cartID }),
						...(authUser?.userID && { "x-user-id": authUser.userID }),
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
				const result = await fetch("/api/push/global", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(req),
					credentials: "include",
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
	}, [globalRep, setGlobalRep, cartID, authUser]);

	return <>{children}</>;
}
