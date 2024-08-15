import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { Progress } from "@blazell/ui/progress";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { Skeleton } from "@blazell/ui/skeleton";
import type { Customer } from "@blazell/validators/client";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import { isString } from "remeda";
import { PageHeader } from "~/components/page-header";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";
import { CustomersTable } from "./customers-table/table";
import { cn } from "@blazell/ui";

export default function CustomersPage() {
	const customers = useDashboardStore((state) => state.customers);
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [searchResults, setSearchResults] = useState<Customer[] | undefined>(
		undefined,
	);
	const [_, startTransition] = useTransition();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSearch = useCallback(
		debounce((value: string) => {
			if (value === "") {
				setSearchResults(undefined);
				return;
			}
			searchWorker?.postMessage({
				type: "CUSTOMER_SEARCH",
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
				if (isString(type) && type === "CUSTOMER_SEARCH") {
					startTransition(() => {
						const customers: Customer[] = [];
						const customerIDs = new Set<string>();
						for (const item of payload) {
							if (item.id.startsWith("user")) {
								if (customerIDs.has(item.id)) continue;
								customers.push(item as Customer);
								customerIDs.add(item.id);
							}
						}
						setSearchResults(customers);
					});
				}
			};
		}
	}, [searchWorker]);
	return (
		<main className="w-full p-2 sm:p-3 flex justify-center pb-16 sm:pb-16 lg:pb-3">
			<div className="justify-center flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
				<section className="w-full ">
					<div className="flex flex-col pb-2 sm:pb-3">
						<div className="flex gap-2 sm:gap-4">
							<Stat type="daily" customers={customers} />
							<Stat type="weekly" customers={customers} />
							<Stat type="monthly" customers={customers} />
						</div>
					</div>
					<div className="flex w-full gap-3 flex-col lg:flex-row">
						<div className="w-full lg:w-8/12">
							<div className="max-w-7xl w-full bg-component border border-border rounded-lg">
								<PageHeader
									title="Customers"
									className="px-4 justify-center md:justify-start"
								/>
								<CustomersTable
									customers={searchResults ?? customers ?? []}
									onSearch={onSearch}
								/>
							</div>
						</div>
						<div className="w-full lg:w-4/12 lg:block hidden relative">
							<CustomersInfo />
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}

function CustomersInfo() {
	const customers = useDashboardStore((state) => state.customers);
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	return (
		<Card className="w-full max-w-sm max-h-[64vh] min-w-[320px] sticky top-10 shadow-none p-0">
			<CardHeader className="p-4 border-b border-border">
				<CardTitle className="font-freeman">New customers</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 min-h-[40vh] p-4">
				<ScrollArea className="h-[60vh]">
					{!isInitialized &&
						Array.from({ length: 5 }).map((_, i) => (
							<div className="flex items-center gap-2" key={i}>
								<Skeleton className="hidden h-9 w-9 rounded-full sm:flex" />
								<div className="grid gap-1">
									<Skeleton className="w-[150px] h-[10px]" />
								</div>

								<Skeleton className="w-[100px] h-[10px]" />
							</div>
						))}
					{customers.map((customer) => (
						<div className="flex items-center gap-2" key={customer.id}>
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="" alt="Avatar" />
								<AvatarFallback>OM</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">
									{customer.user?.username ?? "Unknown"}
								</p>
								<p className="text-sm text-muted-foreground">
									{customer.email}
								</p>
							</div>
							<div className="ml-auto font-medium">+$1,999.00</div>
						</div>
					))}
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

function Stat({
	type,
	customers,
}: { type: "daily" | "weekly" | "monthly"; customers: Customer[] }) {
	const today = new Date().toISOString().split("T")[0]!;

	// Utility function to calculate percentage increase
	const calculatePercentageIncrease = (current: number, previous: number) => {
		if (previous === 0) return current > 0 ? 100 : 0;
		return ((current - previous) / previous) * 100;
	};

	// Aggregate data for required ranges
	const todayCustomers = React.useMemo(
		() => aggregateDataForRange(customers, today, today),
		[customers, today],
	);
	const yesterdayCustomers = React.useMemo(
		() =>
			aggregateDataForRange(customers, getDateNDaysAgo(1), getDateNDaysAgo(1)),
		[customers],
	);
	const weekAgoCustomers = React.useMemo(
		() => aggregateDataForRange(customers, getDateNDaysAgo(6), today),
		[customers, today],
	);
	const lastWeekCustomers = React.useMemo(
		() =>
			aggregateDataForRange(customers, getDateNDaysAgo(13), getDateNDaysAgo(7)),
		[customers],
	);
	const monthAgoCustomers = React.useMemo(
		() => aggregateDataForRange(customers, getDateNDaysAgo(29), today),
		[customers, today],
	);
	const lastMonthCustomers = React.useMemo(
		() =>
			aggregateDataForRange(
				customers,
				getDateNDaysAgo(59),
				getDateNDaysAgo(30),
			),
		[customers],
	);

	// Get amount based on type
	const getNumber = (type: "daily" | "weekly" | "monthly") => {
		switch (type) {
			case "daily":
				return todayCustomers;
			case "weekly":
				return weekAgoCustomers;
			case "monthly":
				return monthAgoCustomers;
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
				return calculatePercentageIncrease(todayCustomers, yesterdayCustomers);
			case "weekly":
				return calculatePercentageIncrease(weekAgoCustomers, lastWeekCustomers);
			case "monthly":
				return calculatePercentageIncrease(
					monthAgoCustomers,
					lastMonthCustomers,
				);
			default:
				return 0;
		}
	};

	const percentageIncrease = getPercentageIncreaseFromLast(type);

	return (
		<Card
			className={cn("max-w-sm", {
				"hidden sm:block": type === "monthly",
			})}
		>
			<CardHeader className="pb-2">
				<CardDescription>
					{type === "daily"
						? "Daily"
						: type === "weekly"
							? "Weekly"
							: "Monthly"}{" "}
					<span className="font-bold">new customers</span>
				</CardDescription>
				<CardTitle className="text-4xl">{`${getNumber(type)}`}</CardTitle>
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
	customers: Customer[],
	startDate: string,
	endDate: string,
): number => {
	return customers
		.filter((customer) => {
			const joinedDate = customer.createdAt.split("T")[0]!;
			return joinedDate >= startDate && joinedDate <= endDate;
		})
		.reduce((acc) => {
			acc++;
			return acc;
		}, 0);
};
