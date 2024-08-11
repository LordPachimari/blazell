import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Authentication } from "server";
import { SESSION_KEY } from "~/server/auth.server";
import { userContext } from "~/sessions.server";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext.parse(cookieHeader)) || {};
	const url = new URL(request.url);
	const origin = url.origin;
	const auth = new Authentication({
		serverURL: origin,
	});

	const sessionId = session.get(SESSION_KEY);
	await auth.invalidateSession(sessionId);
	cookie.user = null;

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
