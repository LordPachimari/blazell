import { OrderComponent } from "~/components/templates/order/order";
import { useGlobalStore } from "~/zustand/store";
export default function Page() {
	const orders = useGlobalStore((state) => state.orders);
	return (
		<main className="flex justify-center w-full p-4">
			<div className="flex flex-col max-w-[650px] justify-center w-full gap-2 mt-20">
				<h1 className="text-center font-bold text-2xl font-freeman py-4">
					My orders
				</h1>
				{orders.map((order) => (
					<OrderComponent key={order.id} order={order} />
				))}
			</div>
		</main>
	);
}
