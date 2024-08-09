import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";

import { parseWithZod } from "@conform-to/zod";
import { AnimatePresence } from "framer-motion";
import { getHonoClient } from "server";
import { checkHoneypot } from "~/server/honeypot.server";
import { Intro } from "./intro";
import { Onboard, UserOnboardSchema } from "./onboard";

export const loader: LoaderFunction = async (args) => {
	const { context } = args;
	const { user } = context;
	if (!user) {
		return redirect("/login");
	}
	return json({});
};
export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	checkHoneypot(formData, context.cloudflare.env.HONEYPOT_SECRET);

	const submission = parseWithZod(formData, {
		schema: UserOnboardSchema,
	});
	if (submission.status !== "success") {
		return json({ result: submission.reply() });
	}
	const url = new URL(request.url);
	const origin = url.origin;
	const honoClient = getHonoClient(origin);
	const usernameResult = await honoClient.api.users.username[":username"].$get({
		param: {
			username: submission.value.username,
		},
	});
	if (usernameResult.ok) {
		const exist = await usernameResult.json();
		if (exist) {
			return json({
				result: submission.reply({
					fieldErrors: {
						username: ["Username already exist."],
					},
				}),
			});
		}
	}
	const onboardResult = await honoClient.api.users.onboard.$post({
		json: {
			username: submission.value.username,
			countryCode: submission.value.countryCode,
		},
	});
	if (onboardResult.ok) {
		return redirect(submission.value.redirectTo ?? "/dashboard");
	}
	return json({
		result: submission.reply({
			fieldErrors: {
				username: ["Something wrong happened. Please try again later."],
			},
		}),
	});
}

export default function Page() {
	const [search] = useSearchParams();
	const step = search.get("step");
	return (
		<main className="w-screen h-screen bg-background">
			<div className="fixed -z-10 left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<AnimatePresence mode="wait">
				{!step && <Intro key="intro" />}
				{step === "create" && <Onboard />}
				{/* {step === "connect" && <ConnectStripe storeId={storeId} />} */}
			</AnimatePresence>
		</main>
	);
}
