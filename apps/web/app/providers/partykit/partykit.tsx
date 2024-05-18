import { useAuth } from "@clerk/remix";
import usePartySocket from "partysocket/react";

import { useReplicache } from "~/zustand/replicache";

export default function PartykitProvider({
	children,
	cartID,
}: Readonly<{
	children: React.ReactNode;
	cartID: string | undefined;
}>) {
	const { dashboardRep, marketplaceRep, userRep, setGlobalRep } =
		useReplicache();
	const { getToken } = useAuth();

	usePartySocket({
		// usePartySocket takes the same arguments as PartySocket.
		host: window.ENV.PARTYKIT_HOST, // or localhost:1999 in dev
		room: "user",

		// in addition, you can provide socket lifecycle event handlers
		// (equivalent to using ws.addEventListener in an effect hook)
		onOpen() {
			console.log("connected");
		},
		onMessage(e) {
			const subspaces = JSON.parse(e.data) as string[];
			console.log("message", subspaces);
			if (userRep) {
				//@ts-ignore
				userRep.puller = async (req) => {
					const start = performance.now();
					const token = await getToken();
					const result = await fetch(
						`${window.ENV.WORKER_URL}/pull/user?${subspaces
							.map((val) => `subspaces=${val}`)
							.join("&")}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
								...(cartID && { "x-cart-id": cartID }),
							},
							body: JSON.stringify(req),
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
				};
				userRep.pull();
			}
		},
		onClose() {
			console.log("closed");
		},
		onError(e) {
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
					const start = performance.now();
					const token = await getToken();
					const result = await fetch(
						`${window.ENV.WORKER_URL}/pull/dashboard?${subspaces
							.map((val) => `subspaces=${val}`)
							.join("&")}`,
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
		onError(e) {
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
			console.log("message", subspaces);
			if (marketplaceRep) {
				//@ts-ignore
				dashboardRep.puller = async (req) => {
					const start = performance.now();
					const token = await getToken();
					const result = await fetch(
						`${window.ENV.WORKER_URL}/pull/marketplace?${subspaces
							.map((val) => `subspaces=${val}`)
							.join("&")}`,
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
		onError(e) {
			console.log("error");
		},
	});

	return <>{children}</>;
}
