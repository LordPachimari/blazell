import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Authentication, SESSION_KEY } from "server/auth";
import { userContext } from "~/sessions.server";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext.parse(cookieHeader)) || {};
	const auth = Authentication({
		bindings: context.cloudflare.bindings,
		env: context.cloudflare.env,
		request,
	});

	const sessionId = session.get(SESSION_KEY);
	await auth.invalidateSession(sessionId);
	cookie.authUser = null;

	return json(
		{},
		{
			headers: {
				"Set-Cookie": await userContext.serialize(cookie, {
					maxAge: 31536000,
					path: "/",
					httpOnly: true,
				}),
			},
		},
	);
}
