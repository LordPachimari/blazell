import { useEffect } from "react";
import { Replicache } from "replicache";
import { useReplicache } from "~/zustand/replicache";

export default function GlobalReplicacheProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const globalRep = useReplicache((state) => state.globalRep);
	const setGlobalRep = useReplicache((state) => state.setGlobalRep);

	useEffect(() => {
		if (globalRep) return;
		const r = new Replicache({
			name: "global",
			licenseKey: window.ENV.REPLICACHE_KEY,
			pullInterval: null,
			indexes: {
				parentID: {
					jsonPointer: "/parentID",
					allowEmpty: true,
				},
			},
			//@ts-ignore
			puller: async (req) => {
				const now = performance.now();
				const result = await fetch(`${window.ENV.WORKER_URL}/static-pull`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(req),
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
		});
		setGlobalRep(r);
	}, [
		globalRep,
		setGlobalRep,
		// getToken
	]);

	return <>{children}</>;
}
