import { type ActionFunctionArgs, redirect, json } from "@remix-run/cloudflare";
import { getHonoClient } from "server";
import { SESSION_KEY } from "~/server/auth.server";

export async function loader({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const url = new URL(request.url);
	const origin = url.origin;
	console.log("CALLBACK CALLED");

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

	const honoClient = getHonoClient(origin);
	const result = await honoClient.api.auth.google.callback.$get({
		query: {
			code,
			codeVerifier,
		},
	});
	if (result.ok) {
		const { type, session: userSession, onboard } = await result.json();
		if (type === "ERROR" || !userSession) {
			return redirect("/error");
		}
		session.set(SESSION_KEY, userSession.id);
		return onboard ? redirect("/onboarding") : redirect("/dashboard");
	}

	console.log("error", result.status);
	redirect("/error");
	return json({});
}
