import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { Effect } from "effect";

export const loader: LoaderFunction = async (args) => {
	const id = args.params.id;
	const { context } = args;

	if (!id) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	const { url } = await Effect.runPromise(
		HttpClientRequest.post(
			`${context.cloudflare.env.SERVER_URL}/stripe/account-link`,
		).pipe(
			HttpClientRequest.jsonBody({
				accountID: id,
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
	if (!url) {
		const errorURL = new URL(`${origin}/error`);
		errorURL.searchParams.set(
			"error",
			"Error creating account link in Stripe.",
		);

		return redirect(errorURL.toString());
	}

	return redirect(url);
};
