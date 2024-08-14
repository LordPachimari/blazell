import { SESSION_KEY } from "@blazell/auth/src";
import { AuthAPI } from "@blazell/validators";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { type ActionFunctionArgs, redirect, json } from "@remix-run/cloudflare";
import { Effect } from "effect";

export async function loader({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const url = new URL(request.url);
	const origin = url.origin;

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");

	if (error) {
		return redirect("/login");
	}
	const stateCookie = session.get("google_oauth_state") ?? null;
	const codeVerifier = session.get("code_verifier") ?? null;
	console.log("all", code, state, stateCookie, codeVerifier);
	console.log("compare", stateCookie !== state, stateCookie, state);
	// verify state
	if (
		!state ||
		!stateCookie ||
		!code ||
		stateCookie !== state ||
		codeVerifier === null
	) {
		return json("Unauthorized", {
			status: 401,
		});
	}
	const {
		session: userSession,
		status,
		onboard,
	} = await Effect.runPromise(
		HttpClientRequest.get(
			`${origin}/api/auth/google/callback?code=${code}&codeVerifier=${codeVerifier}`,
		)
			.pipe(
				HttpClient.fetchOk,
				Effect.flatMap(
					HttpClientResponse.schemaBodyJson(AuthAPI.GoogleCallbackSchema),
				),
				Effect.scoped,
			)
			.pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => {
						console.error(error.toString());
						return {
							status: "error",
							onboard: false,
							session: null,
						};
					}),
				),
			),
	);

	if (status === "error" || !userSession) {
		return redirect("/error");
	}
	session.set(SESSION_KEY, userSession.id);
	return onboard ? redirect("/onboarding") : redirect("/dashboard");
}
