import { Button } from "@blazell/ui/button";
import * as Http from "@effect/platform/HttpClient";
import { Schema } from "@effect/schema";
import { WHIPClient } from "@eyevinn/whip-web-client";
import { Effect } from "effect";
import { useRef, useState } from "react";
import { useRequestInfo } from "~/hooks/use-request-info";
export default function Live() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [whipClient, setWhipClient] = useState<WHIPClient | null>(null);
	const { userContext } = useRequestInfo();
	const { fakeAuthID } = userContext;
	const startBroadcast = async () => {
		console.log("clicked");
		if (whipClient) return;
		try {
			const result = await Effect.runPromise(
				Http.request.get(`${window.ENV.WORKER_URL}/auctions/live-inputs`).pipe(
					Http.request.setHeaders({
						...(fakeAuthID && { "x-fake-auth-id": fakeAuthID }),
					}),
					Http.client.fetch,
					Effect.flatMap(
						Http.response.schemaBodyJson(
							Schema.Struct({
								uid: Schema.String,
								webRTC: Schema.Struct({
									url: Schema.String,
								}),
								webRTCPlayback: Schema.Struct({
									url: Schema.String,
								}),
							}),
						),
					),
					Effect.scoped,
					Effect.orDie,
				),
			);

			const client = new WHIPClient({
				endpoint: result.webRTC.url,
				opts: {
					debug: true,
				},
			});

			await client.setIceServersFromEndpoint();

			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});

			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
			}

			await client
				.ingest(mediaStream)
				.then(() => console.log("ingesting"))
				.catch((e) => console.error(e));
			setWhipClient(client);
		} catch (error) {
			console.error("Failed to start broadcast:", error);
		}
	};
	const stopBroadcast = async () => {
		console.log("stop broadcast");
		if (whipClient) {
			await whipClient.destroy();
			setWhipClient(null);
		}
		if (videoRef?.current?.srcObject) {
			const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
			for (const track of tracks) {
				track.stop();
			}
		}
	};
	console.log("videoRef", videoRef.current);
	return <div className="w-screen h-screen bg-background flex"></div>;
}
