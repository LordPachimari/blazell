import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getHonoClient } from "server";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const url = new URL(request.url);
	const origin = url.origin;

	const honoClient = getHonoClient(origin);
	const result = await honoClient.api.auth.google.$get();
	if (result.ok) {
		const { codeVerifier, state, url } = await result.json();
		session.set("google_oauth_state", state);
		session.set("code_verifier", codeVerifier);
		return redirect(url);
	}
	console.log("error", result.status);
	return null;
}
