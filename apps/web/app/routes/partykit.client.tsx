import usePartySocket from "partysocket/react";
import { useRequestInfo } from "~/hooks/use-request-info";

import { useReplicache } from "~/zustand/replicache";

function PartykitProvider() {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const globalRep = useReplicache((state) => state.globalRep);
	const marketplaceRep = useReplicache((state) => state.marketplaceRep);
	const { userContext } = useRequestInfo();
	const { cartID, user } = userContext;

	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "global",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			console.log("message", subspaces);
			if (globalRep) {
				//@ts-ignore
				globalRep.puller = async (req) => {
					const result = await fetch(
						`${window.ENV.WORKER_URL}/pull/global?${subspaces
							.map((val) => `subspaces=${val}`)
							.join("&")}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								...(user?.id && {
									"x-user-id": user.id,
								}),
								...(cartID && { "x-cart-id": cartID }),
							},
							body: JSON.stringify(req),
						},
					);

					return {
						response: result.status === 200 ? await result.json() : undefined,
						httpRequestInfo: {
							httpStatusCode: result.status,
							errorMessage: result.statusText,
						},
					};
				};
				globalRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError() {
			console.log("error");
		},
	});
	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "dashboard",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			console.log("message", subspaces);
			if (dashboardRep) {
				//@ts-ignore
				dashboardRep.puller = async (req) => {
					const result = await fetch(
						`${window.ENV.WORKER_URL}/pull/dashboard?${subspaces
							.map((val) => `subspaces=${val}`)
							.join("&")}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(req),
						},
					);

					return {
						response: result.status === 200 ? await result.json() : undefined,
						httpRequestInfo: {
							httpStatusCode: result.status,
							errorMessage: result.statusText,
						},
					};
				};
				dashboardRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError() {
			console.log("error");
		},
	});

	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "marketplace",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			if (marketplaceRep) {
				//@ts-ignore
				dashboardRep.puller = async (req) => {
					const result = await fetch(
						`${window.ENV.WORKER_URL}/pull/marketplace?${subspaces
							.map((val) => `subspaces=${val}`)
							.join("&")}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(req),
						},
					);

					return {
						response: result.status === 200 ? await result.json() : undefined,
						httpRequestInfo: {
							httpStatusCode: result.status,
							errorMessage: result.statusText,
						},
					};
				};
				marketplaceRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError() {
			console.log("error");
		},
	});

	return null;
}
export { PartykitProvider };
