import { Avatar, AvatarFallback, AvatarImage } from "@pachi/ui/avatar";
import { Button } from "@pachi/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@pachi/ui/card";
import { Icons } from "@pachi/ui/icons";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import type { Customer, Order } from "@pachi/validators/client";
import { useNavigate, useParams } from "@remix-run/react";
import { OrdersTable } from "../orders/orders-table/table";
export default function CustomerRoute() {
	const params = useParams();
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const customer = ReplicacheStore.getByID<Customer>(dashboardRep, params.id!);
	const orders = ReplicacheStore.scan<Order>(
		dashboardRep,
		`order_${params.id!}`,
	);
	const navigate = useNavigate();
	return (
		<main className="w-full relative flex p-4 md:p-10 justify-center">
			<div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 pt-4">
				<section className="w-full lg:w-8/12 flex flex-col gap-4 order-1 lg:order-0">
					<Button
						variant="ghost"
						href={"/dashboard/customers"}
						className="fixed text-black dark:text-white hover:bg-mauve-a-3 top-4 left-30  z-20"
						onClick={() => navigate(-1)}
					>
						<Icons.left size={20} className="text-black dark:text-white" />
						Back
					</Button>
					<OrdersTable orders={orders} />
				</section>
				<section className="w-full lg:w-4/12 flex order-0 flex-col gap-4 lg:order-1">
					<CustomerInfo customer={customer} />
				</section>
			</div>
		</main>
	);
}
const CustomerInfo = ({
	customer,
}: { customer: Customer | undefined | null }) => {
	return (
		<Card>
			<CardHeader>
				<h1 className="font-semibold text-center">Customer Information</h1>
			</CardHeader>
			<CardContent className="py-4 flex justify-center">
				<div>
					<Avatar className="h-36 w-38">
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>
							{customer?.username?.slice(0, 2).toUpperCase() ??
								customer?.fullName?.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="w-full flex justify-center pt-4 font-semibold">
						<p>{customer?.username ?? customer?.fullName}</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="grid">
					<address className="grid gap-0.5 not-italic ">
						<span className="flex justify-between ">
							<p className="font-semibold">email:</p>
							<a href="mailto:" className="text-mauve-10">
								{customer?.email}
							</a>
						</span>
						<span className="flex justify-between">
							<p className="font-semibold">phone:</p>
							<a href="tel:" className="text-mauve-10">
								{customer?.phone}
							</a>
						</span>
					</address>
				</div>
			</CardFooter>
		</Card>
	);
};
