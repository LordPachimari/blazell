import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { SidebarFormSchema } from "@pachi/validators";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { prefs } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await prefs.parse(cookieHeader)) || {};
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: SidebarFormSchema,
	});

	invariantResponse(
		submission.status === "success",
		"Invalid sidebar state received",
	);
	const { sidebarState } = submission.value;
	console.log("sidebarState", sidebarState);
	cookie.sidebarState = sidebarState;
	return json(
		{ result: submission.reply() },
		{
			headers: {
				"Set-Cookie": await prefs.serialize(cookie, {
					maxAge: 31536000,
					path: "/",
					httpOnly: true,
				}),
			},
		},
	);
}
