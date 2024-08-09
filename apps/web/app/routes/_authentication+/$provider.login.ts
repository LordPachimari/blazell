import { redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { Authentication, getHonoClient } from "server";
import { getAuthSessionStorage } from "~/sessions.server";

export const loader: LoaderFunction = async ({ request, context }) => {
	const url = new URL(request.url);
	const origin = url.origin;
	const { ENVIRONMENT, SESSION_SECRET } = context.cloudflare.env;
	const state = url.searchParams.get("state");
	const code = url.searchParams.get("code");
	const honoClient = getHonoClient(origin);
	if (!state || !code) {
		return new Response("Invalid request", { status: 400 });
	}
	const result = await honoClient.api.auth.login.google.callback.$get({
		query: {
			state,
			code,
		},
	});
	if (result.ok) {
		const { user, signUp, type } = await result.json();
		if (type === "SUCCESS") {
			const auth = new Authentication({
				serverURL: origin,
			});

			const authSessionStorage = getAuthSessionStorage({
				...(ENVIRONMENT && { ENVIRONMENT }),
				...(SESSION_SECRET && { SESSION_SECRET }),
			});
			const session = await auth.createSession(user.id);

			const authSession = await authSessionStorage.getSession(
				request.headers.get("cookie"),
			);
			return redirect(signUp ? "/onboarding" : "/marketplace", {
				headers: {
					...(session &&
						!session.fresh && {
							"set-cookie": await authSessionStorage.commitSession(
								authSession,
								{
									expires: new Date(session.expiresAt),
								},
							),
						}),
				},
			});
		}
		redirect("/login");
	}

	redirect("/login");
};
