import { CheckoutFormSchema } from "@blazell/validators";
import { parseWithZod } from "@conform-to/zod";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { invariantResponse } from "@epic-web/invariant";
import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Console, Effect } from "effect";
import { SESSION_KEY } from "server/auth";
import { userContext } from "~/sessions.server";

export async function action({ request, context }: ActionFunctionArgs) {
	const { session } = context;
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: CheckoutFormSchema,
	});
	const url = new URL(request.url);
	const origin = url.origin;

	const cookieHeader = request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};

	invariantResponse(submission.status === "success", "Invalid theme received");
	const data = submission.value;
	const orderIDs = await Effect.runPromise(
		HttpClientRequest.post(`${origin}/api/carts/complete-cart`).pipe(
			HttpClientRequest.setHeader(
				"Authorization",
				`Bearer ${session.get(SESSION_KEY)}`,
			),
			HttpClientRequest.jsonBody({
				id: userContextCookie.cartID,
				checkoutInfo: data,
			}),
			Effect.andThen(HttpClient.fetchOk),
			Effect.flatMap(
				HttpClientResponse.schemaBodyJson(Schema.Array(Schema.String)),
			),
			Effect.scoped,
			Effect.catchAll((error) =>
				Effect.gen(function* () {
					yield* Console.log(error.toString());
					return [];
				}),
			),
		),
	);

	if (orderIDs.length > 0) {
		return redirect(
			`/order-confirmation?${orderIDs.map((id) => `id=${id}`).join("&")}`,
		);
	}
	const searchParams = new URLSearchParams();
	searchParams.set("error", "Something wrong happened");
	return redirect(`/error?${searchParams.toString()}`);
}
