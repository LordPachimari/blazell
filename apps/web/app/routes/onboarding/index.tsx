import type { User } from "@blazell/validators/client";
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";

import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { AnimatePresence } from "framer-motion";
import { z } from "zod";
import { userContext } from "~/sessions.server";
import { CreateUser } from "./create-user";
import { Intro } from "./intro";

// type LoaderData = {
// 	authID: string;
// };
export const loader: LoaderFunction = async (args) => {
	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};
	// const { getToken, userId } = await getAuth(args);
	// if (!userId) return redirect("/sign-up");
	// const token = await getToken();
	const user = await fetch(`${args.context.cloudflare.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			// Authorization: `Bearer ${token}`,
			"x-fake-auth-id": userContextCookie.fakeAuthID,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (user) {
		return redirect("/dashboard");
	}
	return json({
		// authID: userId,
	});
};
export async function action({ request }: ActionFunctionArgs) {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext.parse(cookieHeader)) || {};
	const formData = await request.formData();

	const submission = parseWithZod(formData, {
		schema: z.object({
			fakeAuthID: z.string(),
		}),
	});
	invariantResponse(
		submission.status === "success",
		"Invalid fake auth received",
	);
	cookie.fakeAuthID = submission.value.fakeAuthID;
	return json(
		{ result: submission.reply() },
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

export default function Page() {
	// const data = useLoaderData<LoaderData>();
	const [search] = useSearchParams();
	const step = search.get("step");
	return (
		<main className="w-screen h-screen bg-background">
			<div className="absolute left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<AnimatePresence mode="wait">
				{!step && <Intro key="intro" />}
				{step === "create" && <CreateUser authID={null} email={undefined} />}
				{/* {step === "connect" && <ConnectStripe storeId={storeId} />} */}
			</AnimatePresence>
		</main>
	);
}
