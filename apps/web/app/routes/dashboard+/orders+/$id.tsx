import { cn } from "@blazell/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { buttonVariants } from "@blazell/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@blazell/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons } from "@blazell/ui/icons";
import type { Order } from "@blazell/validators/client";
import { useParams } from "@remix-run/react";
import { OrderStatus } from "~/components/molecules/statuses/order-status";
import { PaymentStatus } from "~/components/molecules/statuses/payment-status";
import { ShippingStatus } from "~/components/molecules/statuses/shipping-status";
import { Total } from "~/components/templates/cart/total-info";
import {
	LineItem,
	LineItemSkeleton,
} from "~/components/templates/line-item/line-item";
import { useDashboardStore } from "~/zustand/store";

const OrderRoute = () => {
	const params = useParams();
	const orderMap = useDashboardStore((state) => state.orderMap);
	const order = orderMap.get(params.id!);

	return (
		<main className="w-full relative flex p-3 justify-center">
			<div className="w-full max-w-7xl flex flex-col lg:flex-row gap-3">
				<section className="w-full lg:w-8/12 flex flex-col gap-3 order-1 lg:order-0">
					<OrderInfo order={order} />
					<PaymentInfo paymentStatus={order?.paymentStatus ?? "paid"} />
					<ShippingInfo shippingStatus={order?.shippingStatus ?? "pending"} />
				</section>
				<section className="w-full lg:w-4/12 flex order-0 flex-col gap-3 lg:order-1">
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
		<Card className="p-0">
			<CardHeader className="p-4 border-b border-border">
				<h1 className="font-semibold">Customer Information</h1>
			</CardHeader>
			<CardContent className="p-4 border-b border-border flex justify-center">
				<div>
					<Avatar className="size-36">
						<AvatarImage src={order?.user?.avatar ?? undefined} />
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
				<div className="p-4 grid border-b border-border">
					<address className="grid gap-0.5 not-italic ">
						<span className="flex justify-between">
							<p className="font-semibold">email:</p>
							<a
								href="mailto:"
								className="text-slate-11 text-ellipsis overflow-hidden"
							>
								{order?.email}
							</a>
						</span>
						<span className="flex justify-between">
							<p className="font-semibold">phone:</p>
							<a href="tel:" className="text-slate-11">
								{order?.phone}
							</a>
						</span>
					</address>
				</div>
				<div className="grid grid-cols-2 gap-4 p-4 mt-2">
					<div className="grid gap-3">
						<div className="font-semibold">Shipping Information</div>
						<address className="grid gap-0.5 not-italic text-slate-11">
							<span>{order?.fullName}</span>
							<span>{order?.shippingAddress?.address}</span>
							<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
						</address>
					</div>
					<div className="grid gap-3">
						<div className="font-semibold">Billing Information</div>
						<address className="grid gap-0.5 not-italic text-slate-11">
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
				<p className="text-slate-11 text-sm">Customer did not leave a note.</p>
			</CardContent>
		</Card>
	);
};
const OrderInfo = ({ order }: { order: Order | undefined }) => {
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	const items = order?.items ?? [];

	return (
		<Card className="p-0">
			<CardHeader className="flex justify-between gap-2 p-4 border-b border-border">
				<span className="flex justify-between flex-wrap gap-2">
					<h1 className="font-bold text-lg text-ellipsis overflow-hidden">{`${order?.id}`}</h1>
					<div className="flex gap-2 mt-0 no-space-y">
						<OrderStatus status={order?.status ?? "pending"} />
						<DropdownMenu>
							<DropdownMenuTrigger
								className={cn(
									buttonVariants({ size: "icon", variant: "ghost" }),
									"rounded-lg h-8 w-8 p-0 border-transparent hover:border-border hover:bg-slate-3",
								)}
							>
								<Icons.Dots className="h-4 w-4 text-slate-11" />
								<span className="sr-only">Open menu</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center" className="w-[160px]">
								<DropdownMenuItem
									className="flex gap-2"
									// onClick={() => setOpened(true)}
								>
									<Icons.SquareCheck size={14} /> Complete
								</DropdownMenuItem>

								<DropdownMenuItem
									className="flex gap-2"
									// onClick={() => setOpened(true)}
								>
									<Icons.Pending size={14} /> Pending
								</DropdownMenuItem>
								<DropdownMenuItem
									className="flex gap-2"
									// onClick={() => setOpened(true)}
								>
									<Icons.Cancel size={14} /> Cancel
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</span>
				<p className="text-sm text-slate-10">{order?.createdAt}</p>
			</CardHeader>
			<CardContent className="p-4">
				<ul className="flex flex-col gap-2">
					{!isInitialized &&
						Array.from({ length: 3 }).map((_, i) => (
							<LineItemSkeleton key={i} />
						))}
					{items.length === 0 && (
						<p className="text-slate-11 text-center">Order is empty</p>
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
			<CardFooter className="p-4 border-t border-border">
				<Total cartOrOrder={order} lineItems={items} />
			</CardFooter>
		</Card>
	);
};
const PaymentInfo = ({
	paymentStatus,
}: { paymentStatus: Order["paymentStatus"] }) => {
	return (
		<Card className="p-0">
			<CardHeader className="flex font-semibold p-4 border-b border-border justify-between flex-row">
				<p>Payment Information</p>
				<div className="flex gap-2 mt-0 no-space-y">
					<PaymentStatus status={paymentStatus ?? "paid"} />
					<DropdownMenu>
						<DropdownMenuTrigger
							className={cn(
								buttonVariants({ size: "icon", variant: "ghost" }),
								"rounded-lg h-8 w-8 p-0 border-transparent hover:border-border hover:bg-slate-3",
							)}
						>
							<Icons.Dots className="h-4 w-4 text-slate-11" />
							<span className="sr-only">Open menu</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center" className="w-[160px]">
							<DropdownMenuItem
								className="flex gap-2"
								// onClick={() => setOpened(true)}
							>
								<Icons.Edit size={14} /> Edit
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="p-4">
				<div className="grid gap-3">
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="flex items-center gap-1 text-slate-11">
								<Icons.CreditCard className="h-4 w-4" />
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
		<Card className="p-0">
			<CardHeader className="flex p-4 border-b border-border font-semibold justify-between flex-row">
				<p>Shipping</p>
				<div className="flex gap-2 mt-0 no-space-y">
					<ShippingStatus status={shippingStatus ?? "pending"} />
					<DropdownMenu>
						<DropdownMenuTrigger
							className={cn(
								buttonVariants({ size: "icon", variant: "ghost" }),
								"rounded-lg h-8 w-8 p-0 border-transparent hover:border-border hover:bg-slate-3",
							)}
						>
							<Icons.Dots className="h-4 w-4 text-slate-11" />
							<span className="sr-only">Open menu</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center" className="w-[160px]">
							<DropdownMenuItem
								className="flex gap-2"
								// onClick={() => setOpened(true)}
							>
								<Icons.Edit size={14} /> Edit
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
		</Card>
	);
};
