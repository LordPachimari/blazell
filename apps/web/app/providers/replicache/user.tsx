import { useEffect } from "react";
import { Replicache } from "replicache";
import { useAuth } from "@clerk/remix";
import { useReplicache } from "~/zustand/replicache";
import { UserMutators } from "@blazell/replicache";
import usePartySocket from "partysocket/react";

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

	// usePartySocket({
	// 	// usePartySocket takes the same arguments as PartySocket.
	// 	host: partykitHost, // or localhost:1999 in dev
	// 	room: "user",

	// 	// in addition, you can provide socket lifecycle event handlers
	// 	// (equivalent to using ws.addEventListener in an effect hook)
	// 	onOpen() {
	// 		console.log("connected");
	// 	},
	// 	onMessage(e) {
	// 		const subspaces = JSON.parse(e.data) as string[];
	// 		console.log("message", subspaces);
	// 		if (userRep) {
	// 			//@ts-ignore
	// 			userRep.puller = async (req) => {
	// 				const start = performance.now();
	// 				const token = await getToken();
	// 				const result = await fetch(
	// 					`${workerURL}/pull/user?${subspaces
	// 						.map((val) => `subspaces=${val}`)
	// 						.join("&")}`,
	// 					{
	// 						method: "POST",
	// 						headers: {
	// 							"Content-Type": "application/json",
	// 							Authorization: `Bearer ${token}`,
	// 							...(cartID && { "x-cart-id": cartID }),
	// 						},
	// 						body: JSON.stringify(req),
	// 					},
	// 				);
	// 				const end = performance.now();
	// 				console.log("pull time", end - start);

	// 				return {
	// 					response: result.status === 200 ? await result.json() : undefined,
	// 					httpRequestInfo: {
	// 						httpStatusCode: result.status,
	// 						errorMessage: result.statusText,
	// 					},
	// 				};
	// 			};
	// 			userRep.pull();
	// 		}
	// 	},
	// 	onClose() {
	// 		console.log("closed");
	// 	},
	// 	onError(e) {
	// 		console.log("error");
	// 	},
	// });

	useEffect(() => {
		if (userRep) {
			return;
		}

		const r = new Replicache({
			name: "user",
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
				const result = await fetch(`${window.ENV.WORKER_URL}/pull/user`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
						...(cartID && { "x-cart-id": cartID }),
					},
					body: JSON.stringify(req),
					credentials: "include",
				});
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
				const result = await fetch(`${window.ENV.WORKER_URL}/push/user`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(req),
				});

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
