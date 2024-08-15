import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { Progress } from "@blazell/ui/progress";
import { toast } from "@blazell/ui/toast";
import { cartSubtotal } from "@blazell/utils";
import type { Order } from "@blazell/validators/client";
import { Effect, pipe } from "effect";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { isString } from "remeda";
import { ClientOnly } from "remix-utils/client-only";
import { PageHeader } from "~/components/page-header";
import { useWindowSize } from "~/hooks/use-window-size";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";
import { OrderPreview, OrderPreviewMobile } from "./order-preview";
import { OrdersTable } from "./orders-table/table";
import { cn } from "@blazell/ui";

export default function Orders() {
	const orders = useDashboardStore((state) => state.orders);
	const [searchResults, setSearchResults] = useState<Order[] | undefined>(
		undefined,
	);
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [_, startTransition] = useTransition();

	const windowSize = useWindowSize(100);

	const [orderID, _setOrderID] = useState<string | undefined>(undefined);
	const [opened, setOpened] = useState(false);
	const setOrderID = (id: string | undefined) => {
		_setOrderID(id);
		if (id) return setOpened(true);
		setOpened(false);
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSearch = useCallback(
		debounce((value: string) => {
			if (value === "") {
				setSearchResults(undefined);
				return;
			}
			searchWorker?.postMessage({
				type: "ORDER_SEARCH",
				payload: {
					query: value,
				},
			} satisfies SearchWorkerRequest);
		}, 300),
		[searchWorker],
	);
	useEffect(() => {
		if (searchWorker) {
			searchWorker.onmessage = (event: MessageEvent) => {
				const { type, payload } = event.data as SearchWorkerResponse;
				if (isString(type) && type === "ORDER_SEARCH") {
					startTransition(() => {
						const orders: Order[] = [];
						const orderIDs = new Set<string>();
						for (const item of payload) {
							if (item.id.startsWith("order")) {
								if (orderIDs.has(item.id)) continue;
								orders.push(item as Order);
								orderIDs.add(item.id);
							}
						}
						setSearchResults(orders);
					});
				}
			};
		}
	}, [searchWorker]);
	return (
		<main className="w-full p-2 sm:p-3 flex justify-center pb-16 sm:pb-16 lg:pb-3">
			<div className="justify-center flex flex-col w-full max-w-7xl">
				<div className="flex flex-col pb-2 sm:pb-3">
					<div className="flex gap-2 sm:gap-3">
						<Revenue type="daily" orders={orders} />
						<Revenue type="weekly" orders={orders} />
						<Revenue type="monthly" orders={orders} />
						<Numbers type="daily" orders={orders} />
						<Numbers type="weekly" orders={orders} />
						<Numbers type="monthly" orders={orders} />
					</div>
				</div>
				<div className="flex flex-col justify-center gap-2 sm:gap-3 lg:flex-row">
					<section className="w-full xl:w-8/12">
						<div className="max-w-7xl w-full bg-component border border-border rounded-lg">
							<PageHeader
								title="Orders"
								className="px-4 justify-center md:justify-start"
							/>
							<OrdersTable
								orders={searchResults ?? orders ?? []}
								orderID={orderID}
								setOrderID={setOrderID}
								onSearch={onSearch}
							/>
						</div>
					</section>
					<section className="w-full lg:w-4/12 relative lg:flex flex-col items-start hidden">
						{orderID ? (
							<>
								<OrderPreview orderID={orderID} />
								<ClientOnly>
									{() =>
										windowSize.width < 1024 && (
											<OrderPreviewMobile
												orderID={orderID}
												opened={opened}
												setOpened={setOpened}
											/>
										)
									}
								</ClientOnly>
							</>
						) : (
							<div className="h-[50rem] w-[25rem] sticky top-56 flex justify-center items-center border bg-component shadow-inner hover:bg-slate-2  border-border   rounded-lg">
								<h1 className="font-bold text-xl text-slate-10 font-freeman">
									Order preview
								</h1>
							</div>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}

function Revenue({
	type,
	orders,
}: { type: "daily" | "weekly" | "monthly"; orders: Order[] }) {
	const today = new Date().toISOString().split("T")[0]!;

	// Utility function to calculate percentage increase
	const calculatePercentageIncrease = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return ((current - previous) / previous) * 100;
	};

	// Aggregate data for required ranges
	const todayOrders = React.useMemo(
		() => aggregateDataForRange(orders, today, today),
		[orders, today],
	);
	const yesterdayOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(1), getDateNDaysAgo(1)),
		[orders],
	);
	const weekAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(6), today),
		[orders, today],
	);
	const lastWeekOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(13), getDateNDaysAgo(7)),
		[orders],
	);
	const monthAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(29), today),
		[orders, today],
	);
	const lastMonthOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(59), getDateNDaysAgo(30)),
		[orders],
	);

	// Get amount based on type
	const getAmount = (type: "daily" | "weekly" | "monthly") => {
		switch (type) {
			case "daily":
				return todayOrders.totalSales;
			case "weekly":
				return weekAgoOrders.totalSales;
			case "monthly":
				return monthAgoOrders.totalSales;
			default:
				return 0;
		}
	};

	// Calculate percentage increase based on type
	const getPercentageIncreaseFromLast = (
		type: "daily" | "weekly" | "monthly",
	) => {
		switch (type) {
			case "daily":
				return calculatePercentageIncrease(
					todayOrders.totalSales,
					yesterdayOrders.totalSales,
				);
			case "weekly":
				return calculatePercentageIncrease(
					weekAgoOrders.totalSales,
					lastWeekOrders.totalSales,
				);
			case "monthly":
				return calculatePercentageIncrease(
					monthAgoOrders.totalSales,
					lastMonthOrders.totalSales,
				);
			default:
				return 0;
		}
	};

	const percentageIncrease = getPercentageIncreaseFromLast(type);

	return (
		<Card
			className={cn("max-w-sm", {
				"hidden lg:block": type === "monthly",
				"hidden md:block": type === "weekly",
			})}
		>
			<CardHeader className="pb-2">
				<CardDescription>
					This {type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
				</CardDescription>
				<CardTitle className="text-4xl">{`$${getAmount(type)}`}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-xs text-muted-foreground">
					{percentageIncrease >= 0 ? "+" : ""}
					{percentageIncrease.toFixed(2)}% from last{" "}
					{type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
				</div>
			</CardContent>
			<CardFooter className="pt-2">
				<Progress
					value={percentageIncrease}
					aria-label={`${percentageIncrease.toFixed(2)}% increase`}
				/>
			</CardFooter>
		</Card>
	);
}
function Numbers({
	type,
	orders,
}: { type: "daily" | "weekly" | "monthly"; orders: Order[] }) {
	const today = new Date().toISOString().split("T")[0]!;

	// Utility function to calculate percentage increase
	const calculatePercentageIncrease = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return ((current - previous) / previous) * 100;
	};

	// Aggregate data for required ranges
	const todayOrders = React.useMemo(
		() => aggregateDataForRange(orders, today, today),
		[orders, today],
	);
	const yesterdayOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(1), getDateNDaysAgo(1)),
		[orders],
	);
	const weekAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(6), today),
		[orders, today],
	);
	const lastWeekOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(13), getDateNDaysAgo(7)),
		[orders],
	);
	const monthAgoOrders = React.useMemo(
		() => aggregateDataForRange(orders, getDateNDaysAgo(29), today),
		[orders, today],
	);
	const lastMonthOrders = React.useMemo(
		() =>
			aggregateDataForRange(orders, getDateNDaysAgo(59), getDateNDaysAgo(30)),
		[orders],
	);

	// Get amount based on type
	const getNumber = (type: "daily" | "weekly" | "monthly") => {
		switch (type) {
			case "daily":
				return todayOrders.numOrders;
			case "weekly":
				return weekAgoOrders.numOrders;
			case "monthly":
				return monthAgoOrders.numOrders;
			default:
				return 0;
		}
	};

	// Calculate percentage increase based on type
	const getPercentageIncreaseFromLast = (
		type: "daily" | "weekly" | "monthly",
	) => {
		switch (type) {
			case "daily":
				return calculatePercentageIncrease(
					todayOrders.numOrders,
					yesterdayOrders.numOrders,
				);
			case "weekly":
				return calculatePercentageIncrease(
					weekAgoOrders.numOrders,
					lastWeekOrders.numOrders,
				);
			case "monthly":
				return calculatePercentageIncrease(
					monthAgoOrders.numOrders,
					lastMonthOrders.numOrders,
				);
			default:
				return 0;
		}
	};

	const percentageIncrease = getPercentageIncreaseFromLast(type);

	return (
		<Card
			className={cn("max-w-sm", {
				"hidden lg:block": type === "monthly",
				"hidden md:block": type === "weekly",
			})}
		>
			<CardHeader className="pb-2">
				<CardDescription>
					This {type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
				</CardDescription>
				<CardTitle className="text-4xl">{getNumber(type)}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-xs text-muted-foreground">
					{percentageIncrease >= 0 ? "+" : ""}
					{percentageIncrease.toFixed(2)}% from last{" "}
					{type === "daily" ? "day" : type === "weekly" ? "week" : "month"}
				</div>
			</CardContent>
			<CardFooter className="pt-2">
				<Progress
					value={percentageIncrease}
					aria-label={`${percentageIncrease.toFixed(2)}% increase`}
				/>
			</CardFooter>
		</Card>
	);
}

const getDateNDaysAgo = (n: number): string => {
	const date = new Date();
	date.setDate(date.getDate() - n);
	return date.toISOString().split("T")[0]!;
};

const aggregateDataForRange = (
	orders: Order[],
	startDate: string,
	endDate: string,
): { numOrders: number; totalSales: number } => {
	return orders
		.filter((order) => {
			const orderDate = order.createdAt.split("T")[0]!;
			return orderDate >= startDate && orderDate <= endDate;
		})
		.reduce(
			(acc, order) => {
				acc.numOrders++;
				acc.totalSales += Effect.runSync(
					cartSubtotal(order.items, order).pipe(
						Effect.catchTags({
							PriceNotFound: (error) =>
								pipe(
									Effect.succeed(-1),
									Effect.zipLeft(Effect.sync(() => toast.error(error.message))),
								),
						}),
					),
				);
				return acc;
			},
			{ numOrders: 0, totalSales: 0 },
		);
};
