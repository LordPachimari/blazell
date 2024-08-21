import type { Order } from "@blazell/validators/client";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { createCaller } from "server/trpc";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { OrderComponent } from "~/components/templates/order/order";

type LoaderData = {
	orders: Order[];
};
export const loader: LoaderFunction = async (args) => {
	const { context, request } = args;
	const url = new URL(args.request.url);
	const ids = url.searchParams.getAll("id");

	const orders = await createCaller({
		env: context.cloudflare.env,
		request,
		authUser: null,
		bindings: context.cloudflare.bindings,
	}).orders.getByIDs({ ids });
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
