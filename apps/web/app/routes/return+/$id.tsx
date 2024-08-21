import { StripeAccountSchema } from "@blazell/validators";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { type LoaderFunction, redirect } from "@remix-run/cloudflare";
import { Effect } from "effect";
import { createCaller } from "server/trpc";
import { userContext } from "~/sessions.server";

export const loader: LoaderFunction = async ({ context, request, params }) => {
	const cookieHeader = request.headers.get("Cookie");
	const cookie = (await userContext.parse(cookieHeader)) || {};
	const { authUser } = context;
	const accountID = params.id;
	if (!accountID) {
		const errorURL = new URL("/error");
		errorURL.searchParams.set("error", "No account stripe account ID found.");
		return redirect(errorURL.toString());
	}
	const account = await Effect.runPromise(
		HttpClientRequest.get(
			`https://api.stripe.com/v1/accounts/${accountID}`,
		).pipe(
			HttpClientRequest.setHeader(
				"Authorization",
				`Bearer ${context.cloudflare.env.STRIPE_SECRET_KEY}`,
			),

			HttpClient.fetchOk,
			Effect.flatMap(HttpClientResponse.schemaBodyJson(StripeAccountSchema)),
			Effect.scoped,
			Effect.orDie,
		),
	);
	console.log("stripe account", account);
	if (account.details_submitted && account.charges_enabled) {
		const result = await createCaller({
			authUser: authUser ?? null,
			env: context.cloudflare.env,
			request,
			bindings: context.cloudflare.bindings,
		}).stripe.updateStripeAccount({
			stripeAccountID: accountID,
			updates: {
				isOnboarded: true,
			},
		});
		if (result.status === "error") {
			const errorURL = new URL("/error");
			errorURL.searchParams.set(
				"error",
				"Something Bad happened. Please try again later.",
			);
			return redirect(errorURL.toString());
		}
		return redirect("/dashboard/settings/payment/stripe", {
			headers: {
				"Set-Cookie": await userContext.serialize(cookie, {
					maxAge: 31536000,
					path: "/",
					httpOnly: true,
				}),
			},
		});
	}
	return redirect("/dashboard/settings/payment");
};
export default function Return() {
	return (
		<main className="w-screen h-screen flex justify-center items-center">
			<div className="flex flex-col gap-2">
				<h2>Details submitted</h2>
				<p>That's everything we need for now</p>
			</div>
		</main>
	);
}
