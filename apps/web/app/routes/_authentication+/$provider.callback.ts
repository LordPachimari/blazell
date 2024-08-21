import { type ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { SESSION_KEY } from "server/auth";
import { createCaller } from "server/trpc";

export async function loader({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const url = new URL(request.url);

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");

	if (error) {
		console.error("Google OAuth error", error);
		return redirect("/login");
	}
	const stateCookie = session.get("google_oauth_state") ?? null;
	const codeVerifier = session.get("code_verifier") ?? null;
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
		status,
		session: userSession,
		onboard,
	} = await createCaller({
		env: context.cloudflare.env,
		request,
		authUser: null,
		bindings: context.cloudflare.bindings,
	}).auth.googleCallback({
		code,
		codeVerifier,
	});

	if (status === "error" || !userSession) {
		return redirect("/error");
	}
	session.set(SESSION_KEY, userSession.id);
	return onboard ? redirect("/onboarding") : redirect("/dashboard");
}
