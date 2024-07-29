import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { signOut } from "@workos-inc/authkit-remix";

export async function action({ request }: ActionFunctionArgs) {
	return await signOut(request);
}
