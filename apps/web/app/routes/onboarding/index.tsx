import { parseWithZod } from "@conform-to/zod";
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { createCaller } from "server/trpc";
import { checkHoneypot } from "~/server/honeypot.server";
import { Onboard, UserOnboardSchema } from "./onboard";

export const loader: LoaderFunction = async (args) => {
	const { context } = args;
	const { authUser } = context;
	if (!authUser) {
		return redirect("/login");
	}
	if (authUser.username) return redirect("/dashboard");
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
	if (!context.authUser)
		return json({
			result: submission.reply({
				fieldErrors: {
					username: ["Unauthorized."],
				},
			}),
		});
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo");
	const user = await createCaller({
		authUser: null,
		bindings: context.cloudflare.bindings,
		env: context.cloudflare.env,
		request,
	}).users.username({ username: submission.value.username });
	if (user?.username) {
		return json({
			result: submission.reply({
				fieldErrors: {
					username: ["Username already exist."],
				},
			}),
		});
	}
	const result = await createCaller({
		authUser: context.authUser,
		bindings: context.cloudflare.bindings,
		env: context.cloudflare.env,
		request,
	}).users.onboard({
		username: submission.value.username,
		countryCode: submission.value.countryCode,
	});
	if (result.status === "error") {
		return json({
			result: submission.reply({
				fieldErrors: {
					username: [result.message],
				},
			}),
		});
	}
	console.log("ARE YOU HERE?", result);
	return redirectTo ? redirect(redirectTo) : redirect("/dashboard");
}

export default function Page() {
	const [search] = useSearchParams();
	const step = search.get("step");
	return (
		<main className="w-screen h-screen bg-background">
			<div className="fixed -z-10 left-0 right-0 h-[450px] opacity-60 bg-gradient-to-b from-brand-3 to-transparent " />
			<AnimatePresence mode="wait">
				{(!step || step === "create") && <Onboard />}
				{/* {step === "connect" && <ConnectStripe storeId={storeId} />} */}
			</AnimatePresence>
		</main>
	);
}
