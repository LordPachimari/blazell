import { json, type ActionFunctionArgs } from "@remix-run/node";
import { prefs } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await prefs.parse(cookieHeader)) || {};
	const formData = await request.formData();

	const isOpen = formData.get("sidebar") === "open";
	cookie.sidebarIsOpen = isOpen;

	return json(isOpen, {
		headers: {
			"Set-Cookie": await prefs.serialize(cookie),
		},
	});
}
