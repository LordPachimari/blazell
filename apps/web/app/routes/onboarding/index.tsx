import type { User } from "@blazell/validators/client";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";

import { authkitLoader, getSignInUrl } from "@workos-inc/authkit-remix";
import { AnimatePresence } from "framer-motion";
import { CreateUser } from "./create-user";

export const loader = (args: LoaderFunctionArgs) =>
	authkitLoader(
		args,
		async ({ auth }) => {
			if (!auth.user) {
				const signInUrl = await getSignInUrl();
				return redirect(signInUrl);
			}
			const user = await fetch(
				`${args.context.cloudflare.env.WORKER_URL}/users/id/${auth.user.id}`,
				{
					method: "GET",
				},
			).then((res) => res.json() as Promise<User | undefined>);
			if (user) {
				return redirect("/dashboard");
			}
			return json({});
		},
		{ ensureSignedIn: true },
	);

export default function Page() {
	// const data = useLoaderData<LoaderData>();
	const [search] = useSearchParams();
	const step = search.get("step");
	return (
		<main className="w-screen h-screen bg-background">
			<div className="fixed -z-10 left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<AnimatePresence mode="wait">
				{!step || (step === "create" && <CreateUser />)}
				{/* {step === "connect" && <ConnectStripe storeId={storeId} />} */}
			</AnimatePresence>
		</main>
	);
}
