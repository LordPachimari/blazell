import type { Order } from "@blazell/validators/client";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { isArray } from "effect/Array";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";

type LoaderData = {
	orders: Order[];
};
export const loader: LoaderFunction = async (args) => {
	const url = new URL(args.request.url);
	const ids = url.searchParams.get("id");
	const orderIDs = isArray(ids)
		? ids.map((id) => `id=${id}`).join("&")
		: `id=${ids}`;
	const orders = await fetch(
		`${args.context.env.WORKER_URL}/orders/order?${orderIDs}`,
	).then((res) => res.json() as Promise<Order[] | null>);
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
				<div className="max-w-5xl ">
					<h1 className="text-2xl font-bold">Order Confirmation</h1>
					<p>Thank you for your order! </p>
				</div>
			</main>
		</SidebarLayoutWrapper>
	);
}
