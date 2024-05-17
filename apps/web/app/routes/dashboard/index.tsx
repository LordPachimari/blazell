import { getAuth } from "@clerk/remix/ssr.server";
import { redirect, type LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async (args) => {
	const { userId } = await getAuth(args);
	if (!userId) {
		return redirect("/sign-in");
	}
	return {};
};
export default function Layout() {
	return <></>;
}
