import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { Progress } from "@blazell/ui/progress";
import { useCallback, useState } from "react";
import { PageHeader } from "~/components/page-header";
import { OrderPreview, OrderPreviewMobile } from "./order-preview";
import { OrdersTable } from "./orders-table/table";
import { useDashboardStore } from "~/zustand/store";

export default function Orders() {
	const orders = useDashboardStore((state) => state.orders);
	const createOrder = useCallback(async () => {
		// await dashboardRep?.mutate.createOrder({
		// });
	}, []);
	const [orderID, _setOrderID] = useState<string | undefined>(undefined);
	const [opened, setOpened] = useState(false);
	const setOrderID = (id: string | undefined) => {
		_setOrderID(id);
		if (id) return setOpened(true);
		setOpened(false);
	};
	return (
		<main className="w-full p-4 lg:p-10 justify-center flex flex-col lg:flex-row gap-6">
			<section className="w-full xl:w-8/12">
				<div className="flex flex-col pb-4">
					<PageHeader title="Orders" />
					<div className="flex gap-4">
						<Revenue type="daily" amount={20} />
						<Revenue type="weekly" amount={200} />
						<Revenue type="monthly" amount={2000} />
					</div>
				</div>
				<OrdersTable
					orders={orders ?? []}
					createOrder={createOrder}
					orderID={orderID}
					setOrderID={setOrderID}
				/>
			</section>
			<section className="w-full lg:w-4/12 relative lg:flex flex-col items-start hidden">
				{orderID ? (
					<>
						<OrderPreview orderID={orderID} />
						<OrderPreviewMobile
							orderID={orderID}
							opened={opened}
							setOpened={setOpened}
						/>
					</>
				) : (
					<div className="h-[58rem] w-[24rem] sticky top-10 flex justify-center items-center border bg-mauve-3 hover:bg-mauve-a-3 border-mauve-7 rounded-2xl">
						<h1 className="font-bold text-xl text-mauve-8">Order preview</h1>
					</div>
				)}
			</section>
		</main>
	);
}

function Revenue({
	type,
	amount,
}: { type: "daily" | "weekly" | "monthly"; amount: number }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardDescription>
					This {type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
				</CardDescription>
				<CardTitle className="text-4xl">{`$${amount}`}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-xs text-muted-foreground">
					+25% from last{" "}
					{type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
				</div>
			</CardContent>
			<CardFooter className="pt-2">
				<Progress value={25} aria-label="25% increase" />
			</CardFooter>
		</Card>
	);
}
