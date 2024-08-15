import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@blazell/ui/card";
import type { Customer } from "@blazell/validators/client";
import { useParams } from "@remix-run/react";
import { useDashboardStore } from "~/zustand/store";
import { OrdersTable } from "../orders+/orders-table/table";

export default function CustomerRoute() {
	const params = useParams();
	const orders = useDashboardStore((state) => state.orders).filter(
		(order) => order.customerID === params.id!,
	);
	const customerMap = useDashboardStore((state) => state.customerMap);
	const customer = customerMap.get(params.id!);
	return (
		<main className="w-full relative flex p-3 justify-center">
			<div className="w-full max-w-7xl flex flex-col lg:flex-row gap-3">
				<section className="w-full lg:w-8/12 flex flex-col gap-3 order-1 lg:order-0">
					<div className="max-w-7xl w-full bg-component border border-border rounded-lg">
						<h1 className="font-freeman text-lg p-4 pb-0">
							Orders made by{" "}
							{customer?.user?.username ?? customer?.user?.fullName}
						</h1>

						<OrdersTable orders={orders} toolbar={false} />
					</div>
				</section>
				<section className="w-full lg:w-4/12 flex order-0 flex-col gap-3 lg:order-1">
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
		<Card className="p-0">
			<CardHeader className="p-4 border-b border-border">
				<h1 className="font-semibold">Customer Information</h1>
			</CardHeader>
			<CardContent className="p-4 border-b border-border flex justify-center">
				<div>
					<Avatar className="h-36 w-38">
						<AvatarImage src="https://github.com/shadcn.png" />
						<AvatarFallback>
							{customer?.user?.username?.slice(0, 2).toUpperCase() ??
								customer?.user?.fullName?.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="w-full flex justify-center pt-4 font-semibold">
						<p>{customer?.user?.username ?? customer?.user?.fullName}</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="grid p-4">
					<address className="grid gap-0.5 not-italic ">
						<span className="flex justify-between ">
							<p className="font-semibold">email:</p>
							<a href="mailto:" className="text-slate-10">
								{customer?.email}
							</a>
						</span>
						<span className="flex justify-between">
							<p className="font-semibold">phone:</p>
							<a href="tel:" className="text-slate-10">
								{customer?.user?.phone}
							</a>
						</span>
					</address>
				</div>
			</CardFooter>
		</Card>
	);
};
