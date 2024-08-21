import { parseWithZod } from "@conform-to/zod";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { invariantResponse } from "@epic-web/invariant";
import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Effect } from "effect";
import { z } from "zod";

export async function action({ request, context }: ActionFunctionArgs) {
	const url = new URL(request.url);
	const origin = url.origin;
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: z.object({
			accountID: z.string(),
		}),
	});

	invariantResponse(submission.status === "success", "Invalid theme received");
	const data = submission.value;
	const { url: stripeURL } = await Effect.runPromise(
		HttpClientRequest.post(
			`${context.cloudflare.env.SERVER_URL}/stripe/account-link`,
		).pipe(
			HttpClientRequest.jsonBody({
				accountID: data.accountID,
			}),
			Effect.andThen(HttpClient.fetchOk),
			Effect.flatMap(
				HttpClientResponse.schemaBodyJson(
					Schema.Struct({
						url: Schema.String,
					}),
				),
			),
			Effect.scoped,
			Effect.catchAll((error) =>
				Effect.sync(() => {
					console.error(error);
					return { url: null };
				}),
			),
		),
	);
	if (!stripeURL) {
		const errorURL = new URL(`${origin}/error`);
		errorURL.searchParams.set(
			"error",
			"Error creating account link in Stripe.",
		);

		return redirect(errorURL.toString());
	}
	return redirect(stripeURL);
}
