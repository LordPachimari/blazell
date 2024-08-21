import { CheckoutFormSchema } from "@blazell/validators";
import { parseWithZod } from "@conform-to/zod";
import { invariantResponse } from "@epic-web/invariant";
import { redirect, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { createCaller } from "server/trpc";
import { userContext } from "~/sessions.server";

export async function action({ request, context }: ActionFunctionArgs) {
	const formData = await request.formData();
	const submission = parseWithZod(formData, {
		schema: CheckoutFormSchema,
	});

	const cookieHeader = request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};

	invariantResponse(submission.status === "success", "Invalid theme received");
	const data = submission.value;
	const orderIDs = await createCaller({
		authUser: null,
		bindings: context.cloudflare.bindings,
		env: context.cloudflare.env,
		request,
	}).carts.completeCart({
		id: userContextCookie.cartID,
		checkoutInfo: data,
	});

	if (orderIDs.length > 0) {
		return redirect(
			`/order-confirmation?${orderIDs.map((id) => `id=${id}`).join("&")}`,
		);
	}
	const searchParams = new URLSearchParams();
	searchParams.set("error", "Something wrong happened");
	return redirect(`/error?${searchParams.toString()}`);
}
