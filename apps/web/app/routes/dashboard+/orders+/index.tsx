import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { Progress } from "@blazell/ui/progress";
import type { Order } from "@blazell/validators/client";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useState, useTransition } from "react";
import { isString } from "remeda";
import { ClientOnly } from "remix-utils/client-only";
import { PageHeader } from "~/components/page-header";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";
import { OrderPreview, OrderPreviewMobile } from "./order-preview";
import { OrdersTable } from "./orders-table/table";
import { useWindowSize } from "~/hooks/use-window-size";

export default function Orders() {
	const orders = useDashboardStore((state) => state.orders);
	const [searchResults, setSearchResults] = useState<Order[] | undefined>(
		undefined,
	);
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [_, startTransition] = useTransition();

	const windowSize = useWindowSize(100);

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
		<main className="w-full p-4 md:py-6 flex justify-center ">
			<div className="justify-center flex flex-col w-full lg:flex-row gap-6 max-w-7xl">
				<section className="w-full xl:w-8/12">
					<div className="flex flex-col pb-4">
						<PageHeader
							title="Orders"
							className="justify-center md:justify-start"
						/>
						<div className="hidden md:flex gap-4">
							<Revenue type="daily" amount={20} />
							<Revenue type="weekly" amount={200} />
							<Revenue type="monthly" amount={2000} />
						</div>
					</div>
					<OrdersTable
						orders={searchResults ?? orders ?? []}
						createOrder={createOrder}
						orderID={orderID}
						setOrderID={setOrderID}
						onSearch={onSearch}
					/>
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
						<div className="h-[58rem] w-[24rem] sticky top-10 flex justify-center items-center border bg-component shadow-inner hover:bg-slate-2  border-border   rounded-lg">
							<h1 className="font-bold text-xl text-slate-8">Order preview</h1>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}

function Revenue({
	type,
	amount,
}: { type: "daily" | "weekly" | "monthly"; amount: number }) {
	return (
		<Card className="max-w-sm">
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
