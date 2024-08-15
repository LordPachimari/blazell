import type { Order } from "@blazell/validators/client";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Console, Effect } from "effect";
import { isArray } from "effect/Array";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { OrderComponent } from "~/components/templates/order/order";

type LoaderData = {
	orders: Order[];
};
export const loader: LoaderFunction = async (args) => {
	const url = new URL(args.request.url);
	const origin = url.origin;
	const ids = url.searchParams.get("id");
	const orderIDs = isArray(ids)
		? ids.map((id) => `id=${id}`).join("&")
		: `id=${ids}`;

	const orders = (await Effect.runPromise(
		HttpClientRequest.get(`${origin}/api/orders/order?${orderIDs}`).pipe(
			HttpClient.fetchOk,
			HttpClientResponse.json,
			Effect.scoped,
			Effect.catchAll((error) =>
				Effect.gen(function* () {
					yield* Console.log(error.toString());
					return undefined;
				}),
			),
		),
	)) as Order[] | undefined;
	if (!orders) {
		throw new Response(null, {
			status: 404,
			statusText: "Not Found",
		});
	}

	return json({
		orders,
	});
};
export default function OrderConfirmation() {
	const { orders } = useLoaderData<LoaderData>();
	return (
		<SidebarLayoutWrapper>
			<main className="p-4 flex justify-center mt-10 md:mt-20">
				<div className="flex flex-col max-w-[650px] gap-4 justify-center w-full mt-20">
					<div className="flex flex-col gap-2 ">
						<h1 className="text-2xl font-bold text-center">
							Order Confirmation
						</h1>
						<p className="text-center">Thank you for your order! </p>
					</div>
					{orders.map((order) => (
						<OrderComponent key={order.id} order={order} />
					))}
				</div>
			</main>
		</SidebarLayoutWrapper>
	);
}
