import type { User } from "@blazell/validators/client";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
import CreateUserPage from "./create-user-page";
import { useLoaderData } from "@remix-run/react";
import { useUser } from "@clerk/remix";

type LoaderData = {
	authID: string;
};
export const loader: LoaderFunction = async (args) => {
	const { getToken, userId } = await getAuth(args);
	if (!userId) return redirect("/sign-up");
	const token = await getToken();
	const user = await fetch(`${args.context.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (user) {
		return redirect("/dashboard");
	}
	return json({
		authID: userId,
	});
};
export default function Page() {
	const data = useLoaderData<LoaderData>();
	const { user } = useUser();
	return (
		<CreateUserPage
			authID={data.authID}
			email={user?.emailAddresses[0]?.emailAddress}
		/>
	);
}
