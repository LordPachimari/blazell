import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getHonoClient } from "server";

export async function action({ request }: ActionFunctionArgs) {
	const url = new URL(request.url);
	const origin = url.origin;

	const honoClient = getHonoClient(origin);
	const result = await honoClient.api.auth.login.google.$get();
	if (result.ok) {
		const json = await result.json();
		return redirect(json.url);
	}
}
