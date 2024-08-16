import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { createCaller } from "server/trpc";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;

	const {
		codeVerifier,
		state,
		url: googleURL,
		status,
	} = await createCaller({
		env: context.cloudflare.env,
		request,
		authUser: null,
		bindings: context.cloudflare.bindings,
	}).auth.google();
	if (status === "error" || !googleURL || !codeVerifier || !state) {
		return redirect("/error");
	}

	session.set("google_oauth_state", state);
	session.set("code_verifier", codeVerifier);
	return redirect(googleURL);
}
