import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { userContext } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext.parse(cookieHeader)) || {};

	cookie.cartID = null;
	return json(
		{ result: {} },
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
