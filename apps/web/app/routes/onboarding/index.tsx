import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunction,
} from "@remix-run/cloudflare";
import { useSearchParams } from "@remix-run/react";
import { UsersAPI } from "@blazell/validators";
import { parseWithZod } from "@conform-to/zod";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Effect } from "effect";
import { AnimatePresence } from "framer-motion";
import { checkHoneypot } from "~/server/honeypot.server";
import { Onboard, UserOnboardSchema } from "./onboard";
import { SESSION_KEY } from "server/auth";

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
	const redirectTo = url.searchParams.get("redirectTo");
	const { username } = await Effect.runPromise(
		HttpClientRequest.get(
			`${origin}/api/users/username/${submission.value.username}`,
		).pipe(
			HttpClient.fetchOk,
			Effect.flatMap(
				HttpClientResponse.schemaBodyJson(UsersAPI.UsernameSchema),
			),
			Effect.scoped,
			Effect.orDie,
		),
	);
	if (username) {
		return json({
			result: submission.reply({
				fieldErrors: {
					username: ["Username already exist."],
				},
			}),
		});
	}
	const session = context.session;
	const sessionID = session.get(SESSION_KEY);
	const { status } = await Effect.runPromise(
		HttpClientRequest.post(`${origin}/api/users/onboard`)
			.pipe(
				HttpClientRequest.setHeader("Authorization", `Bearer ${sessionID}`),
				HttpClientRequest.jsonBody({
					username: submission.value.username,
					countryCode: submission.value.countryCode,
				}),
				Effect.andThen(HttpClient.fetchOk),
				Effect.flatMap(
					HttpClientResponse.schemaBodyJson(UsersAPI.OnboardSchema),
				),
				Effect.scoped,
			)
			.pipe(
				Effect.catchAll((error) =>
					Effect.sync(() => {
						console.error(error.toString());
						return {
							status: "error",
						};
					}),
				),
			),
	);
	if (status === "error") {
		return json({
			result: submission.reply({
				fieldErrors: {
					username: ["Something wrong happened. Please try again later."],
				},
			}),
		});
	}
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
