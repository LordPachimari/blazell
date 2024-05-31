import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { Button } from "@blazell/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@blazell/ui/card";
import { Icons } from "@blazell/ui/icons";
import { Separator } from "@blazell/ui/separator";
import type {
	LineItem as LineItemType,
	Order,
} from "@blazell/validators/client";
import { useNavigate, useParams } from "@remix-run/react";
import { OrderStatus } from "~/components/molecules/statuses/order-status";
import { PaymentStatus } from "~/components/molecules/statuses/payment-status";
import { ShippingStatus } from "~/components/molecules/statuses/shipping-status";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";

const OrderRoute = () => {
	const params = useParams();
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const order = ReplicacheStore.getByID<Order>(dashboardRep, params.id!);
	const navigate = useNavigate();
	return (
		<main className="w-full relative flex p-4 md:p-10 justify-center">
			<div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 pt-6">
				<section className="w-full lg:w-8/12 flex flex-col gap-4 order-1 lg:order-0">
					<Button
						variant="ghost"
						href="/dashboard/orders"
						className="fixed text-mauve-11 dark:text-white top-4 left-30  z-20"
						onClick={() => navigate("/dashboard/orders")}
					>
						<Icons.left size={20} className="text-black dark:text-white" />
						Back to orders
					</Button>
					<OrderInfo order={order} />
					<PaymentInfo paymentStatus={order?.paymentStatus ?? "paid"} />
					<ShippingInfo shippingStatus={order?.shippingStatus ?? "pending"} />
				</section>
				<section className="w-full lg:w-4/12 flex order-0 flex-col gap-4 lg:order-1">
					<CustomerInfo order={order} />
					<CustomerNote />
				</section>
			</div>
		</main>
	);
};
export default OrderRoute;
const CustomerInfo = ({ order }: { order: Order | undefined | null }) => {
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
							{order?.user?.username?.slice(0, 2).toUpperCase() ??
								order?.fullName?.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="w-full flex justify-center pt-4 font-semibold">
						<p>{order?.user?.username ?? order?.fullName}</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<div className="grid">
					<address className="grid gap-0.5 not-italic ">
						<span className="flex justify-between">
							<p className="font-semibold">email:</p>
							<a
								href="mailto:"
								className="text-mauve-10 text-ellipsis overflow-hidden"
							>
								{order?.email}
							</a>
						</span>
						<span className="flex justify-between">
							<p className="font-semibold">phone:</p>
							<a href="tel:" className="text-mauve-10">
								{order?.phone}
							</a>
						</span>
					</address>
				</div>
				<div className="grid grid-cols-2 gap-4 mt-2">
					<div className="grid gap-3">
						<div className="font-semibold">Shipping Information</div>
						<address className="grid gap-0.5 not-italic text-muted-foreground">
							<span>{order?.fullName}</span>
							<span>{order?.shippingAddress?.address}</span>
							<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
						</address>
					</div>
					<div className="grid gap-3">
						<div className="font-semibold">Billing Information</div>
						<address className="grid gap-0.5 not-italic text-muted-foreground">
							<span>{order?.fullName}</span>
							<span>{order?.shippingAddress?.address}</span>
							<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
						</address>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
};
const CustomerNote = () => {
	return (
		<Card>
			<CardHeader>
				<h1>Customer Note</h1>
			</CardHeader>
			<CardContent>
				<p className="text-mauve-11 text-sm">Customer did not leave a note.</p>
			</CardContent>
		</Card>
	);
};
const OrderInfo = ({ order }: { order: Order | null | undefined }) => {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const items = ReplicacheStore.scan<LineItemType>(
		dashboardRep,
		`line_item_${order?.id}`,
	);

	return (
		<Card>
			<CardHeader className="flex justify-between">
				<span className="flex justify-between flex-wrap">
					<h1 className="font-bold text-xl text-ellipsis overflow-hidden">{`Order: ${order?.id}`}</h1>
					<OrderStatus status={order?.status ?? "pending"} />
				</span>
				<p className="text-sm text-mauve-10">{order?.createdAt}</p>
			</CardHeader>
			<CardContent>
				<ul className="flex flex-col gap-2">
					<Separator className="my-2" />
					{items.length === 0 && (
						<p className="text-mauve-11 text-center">Order is empty</p>
					)}
					{items.map((item) => (
						<LineItem
							lineItem={item}
							key={item.id}
							currencyCode={order?.currencyCode ?? "AUD"}
							readonly={true}
						/>
					))}
				</ul>
			</CardContent>
			<CardFooter>
				<Total cartOrOrder={order} lineItems={items} />
			</CardFooter>
		</Card>
	);
};
const PaymentInfo = ({
	paymentStatus,
}: { paymentStatus: Order["paymentStatus"] }) => {
	return (
		<Card>
			<CardHeader className="flex font-semibold justify-between flex-row">
				<p>Payment Information</p>
				<PaymentStatus status={paymentStatus ?? "paid"} />
			</CardHeader>
			<CardContent className="py-4">
				<div className="grid gap-3">
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="flex items-center gap-1 text-muted-foreground">
								<Icons.creditCard className="h-4 w-4" />
								Visa
							</dt>
							<dd>**** **** **** 4532</dd>
						</div>
					</dl>
				</div>
			</CardContent>
		</Card>
	);
};
const ShippingInfo = ({
	shippingStatus,
}: { shippingStatus: Order["shippingStatus"] }) => {
	return (
		<Card>
			<CardHeader className="flex font-semibold justify-between flex-row">
				<p>Shipping</p>
				<ShippingStatus status={shippingStatus ?? "pending"} />
			</CardHeader>
		</Card>
	);
};
