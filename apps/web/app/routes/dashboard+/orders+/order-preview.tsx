import { cn } from "@blazell/ui";
import { Button, buttonVariants } from "@blazell/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { DialogContent, DialogRoot } from "@blazell/ui/dialog-vaul";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { Separator } from "@blazell/ui/separator";
import { Link } from "@remix-run/react";
import { Copy, CreditCard, MoreVertical } from "lucide-react";
import { OrderStatus } from "~/components/molecules/statuses/order-status";
import { PaymentStatus } from "~/components/molecules/statuses/payment-status";
import { Total } from "~/components/templates/cart/total-info";
import { LineItem } from "~/components/templates/line-item/line-item";
import { useWindowSize } from "~/hooks/use-window-size";
import { useDashboardStore } from "~/zustand/store";

export const OrderPreview = ({ orderID }: { orderID: string }) => {
	const orderMap = useDashboardStore((state) => state.orderMap);
	const order = orderMap.get(orderID);
	const items = order?.items ?? [];

	return (
		<Card
			className="hidden lg:block overflow-hidden w-[24rem] p-0 sticky top-10"
			x-chunk="dashboard-05-chunk-4"
		>
			<CardHeader className="flex border-b border-border   p-6 h-[5rem] flex-row justify-between items-center bg-mauve-a-2">
				<div className="flex flex-col">
					<CardTitle className="flex items-center text-sm">
						{`Order ${orderID}`}
						<Button
							size="icon"
							variant="outline"
							className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Copy className="h-3 w-3" />
							<span className="sr-only">Copy Order ID</span>
						</Button>
					</CardTitle>
					<CardDescription>Date: {order?.createdAt}</CardDescription>
				</div>
				<div className="flex gap-1">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="outline" className="h-8 w-8">
								<MoreVertical className="h-3.5 w-3.5" />
								<span className="sr-only">More</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Edit</DropdownMenuItem>
							<DropdownMenuItem>Export</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="p-6 pt-2 text-sm ">
				<div className="grid gap2">
					<div className="font-semibold flex justify-between py-2">
						<p>Order status</p>
						<OrderStatus status={order?.status ?? "pending"} />
					</div>

					<ScrollArea className="h-[12rem] p-2">
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
					</ScrollArea>

					<Total cartOrOrder={order} lineItems={items} />
				</div>
				<div className="grid grid-cols-2 gap-4 mt-2">
					<div className="grid gap-3">
						<div className="font-semibold">Shipping Information</div>
						<address className="grid gap-0.5 not-italic text-mauve-11">
							<span>{order?.fullName}</span>
							<span>{order?.shippingAddress?.address}</span>
							<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
						</address>
					</div>
					<div className="grid auto-rows-max gap-3">
						<div className="font-semibold">Billing Information</div>
						<address className="grid gap-0.5 not-italic text-mauve-11">
							<span>{order?.fullName}</span>
							<span>{order?.shippingAddress?.address}</span>
							<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
						</address>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="grid gap-3">
					<div className="font-semibold">Customer Information</div>
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="text-mauve-11">Customer</dt>
							<dd>{order?.fullName}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-mauve-11">{order?.email}</dt>
							<dd>
								<a href="mailto:">{order?.email}</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-mauve-11">Phone</dt>
							<dd>
								<a href="tel:">{order?.phone}</a>
							</dd>
						</div>
					</dl>
				</div>
				<Separator className="my-4" />
				<div className="grid gap-3 mb-4">
					<div className="font-semibold flex items-center justify-between">
						<p>Payment Information</p>
						<PaymentStatus status={order?.paymentStatus ?? "paid"} />
					</div>
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="flex items-center gap-1 text-mauve-11">
								<CreditCard className="h-4 w-4" />
								Visa
							</dt>
							<dd>**** **** **** 4532</dd>
						</div>
					</dl>
				</div>
				<Link
					prefetch="viewport"
					to={`/dashboard/orders/${orderID}`}
					className={cn("w-full", buttonVariants())}
				>
					Manage
				</Link>
			</CardContent>
			<CardFooter className="flex p-6 flex-row items-center border-t border-border   bg-mauve-a-2 h-[3rem]">
				<div className="text-xs text-mauve-11">
					Updated <time dateTime="2023-11-23">{order?.updatedAt}</time>
				</div>
			</CardFooter>
		</Card>
	);
};
export const OrderPreviewMobile = ({
	opened,
	setOpened,
	orderID,
}: { opened: boolean; setOpened: (val: boolean) => void; orderID: string }) => {
	const orderMap = useDashboardStore((state) => state.orderMap);
	const order = orderMap.get(orderID);
	const items = order?.items ?? [];
	const windowSize = useWindowSize(100);
	if (windowSize.width > 1024) return null;

	return (
		<DialogRoot
			direction={windowSize.width < 640 ? "bottom" : "right"}
			open={opened}
			onOpenChange={setOpened}
		>
			<DialogContent>
				<CardHeader className="flex border-b border-border   p-6 h-[5rem] flex-row justify-between items-center bg-mauve-a-2">
					<div className="flex flex-col">
						<CardTitle className="flex items-center text-sm">
							{`Order ${orderID}`}
							<Button
								size="icon"
								variant="outline"
								className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<Copy className="h-3 w-3" />
								<span className="sr-only">Copy Order ID</span>
							</Button>
						</CardTitle>
						<CardDescription>Date: {order?.createdAt}</CardDescription>
					</div>
					<div className="flex gap-1">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="outline" className="h-8 w-8">
									<MoreVertical className="h-3.5 w-3.5" />
									<span className="sr-only">More</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>Edit</DropdownMenuItem>
								<DropdownMenuItem>Export</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent className="p-6 pt-2 text-sm ">
					<div className="grid gap2">
						<div className="font-semibold flex justify-between py-2">
							<p>Order status</p>
							<OrderStatus status={order?.status ?? "pending"} />
						</div>

						<ScrollArea className="h-[12rem] p-2">
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
						</ScrollArea>

						<Total cartOrOrder={order} lineItems={items} />
					</div>
					<div className="grid grid-cols-2 gap-4 mt-2">
						<div className="grid gap-3">
							<div className="font-semibold">Shipping Information</div>
							<address className="grid gap-0.5 not-italic text-mauve-11">
								<span>{order?.fullName}</span>
								<span>{order?.shippingAddress?.address}</span>
								<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
							</address>
						</div>
						<div className="grid auto-rows-max gap-3">
							<div className="font-semibold">Billing Information</div>
							<address className="grid gap-0.5 not-italic text-mauve-11">
								<span>{order?.fullName}</span>
								<span>{order?.shippingAddress?.address}</span>
								<span>{`${order?.shippingAddress?.city}, ${order?.shippingAddress?.province}, ${order?.shippingAddress?.postalCode}`}</span>
							</address>
						</div>
					</div>
					<Separator className="my-4" />
					<div className="grid gap-3">
						<div className="font-semibold">Customer Information</div>
						<dl className="grid gap-3">
							<div className="flex items-center justify-between">
								<dt className="text-mauve-11">Customer</dt>
								<dd>{order?.fullName}</dd>
							</div>
							<div className="flex items-center justify-between">
								<dt className="text-mauve-11">{order?.email}</dt>
								<dd>
									<a href="mailto:">{order?.email}</a>
								</dd>
							</div>
							<div className="flex items-center justify-between">
								<dt className="text-mauve-11">Phone</dt>
								<dd>
									<a href="tel:">{order?.phone}</a>
								</dd>
							</div>
						</dl>
					</div>
					<Separator className="my-4" />
					<div className="grid gap-3 mb-4">
						<div className="font-semibold flex items-center justify-between">
							<p>Payment Information</p>
							<PaymentStatus status={order?.paymentStatus ?? "paid"} />
						</div>
						<dl className="grid gap-3">
							<div className="flex items-center justify-between">
								<dt className="flex items-center gap-1 text-mauve-11">
									<CreditCard className="h-4 w-4" />
									Visa
								</dt>
								<dd>**** **** **** 4532</dd>
							</div>
						</dl>
					</div>
					<Link
						prefetch="viewport"
						to={`/dashboard/orders/${orderID}`}
						className={cn("w-full", buttonVariants())}
					>
						Manage
					</Link>
				</CardContent>
				<CardFooter className="flex p-6 flex-row items-center border-t border-border   bg-mauve-a-2 h-[3rem]">
					<div className="text-xs text-mauve-11">
						Updated <time dateTime="2023-11-23">{order?.updatedAt}</time>
					</div>
				</CardFooter>
			</DialogContent>
		</DialogRoot>
	);
};
