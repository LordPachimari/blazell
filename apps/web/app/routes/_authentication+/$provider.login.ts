import { AuthAPI } from "@blazell/validators";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Effect } from "effect";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const url = new URL(request.url);
	const origin = url.origin;

	const {
		status,
		url: googleURL,
		codeVerifier,
		state,
	} = await Effect.runPromise(
		HttpClientRequest.get(`${origin}/api/auth/google`)
			.pipe(
				HttpClient.fetchOk,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(AuthAPI.GoogleSchema)),
				Effect.scoped,
			)
			.pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => {
						console.error(error.toString());
						return {
							status: "error",
							url: null,
							codeVerifier: null,
							state: null,
						};
					}),
				),
			),
	);
	console.log("all from login", status, googleURL, codeVerifier, state);
	if (status === "error" || !googleURL || !codeVerifier || !state) {
		return redirect("/error");
	}

	session.set("google_oauth_state", state);
	session.set("code_verifier", codeVerifier);
	return redirect(googleURL);
}
