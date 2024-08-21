import { redirect, type LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = () => {
	return redirect("/dashboard/settings/general");
};
