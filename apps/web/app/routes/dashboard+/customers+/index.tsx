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
import { Skeleton } from "@blazell/ui/skeleton";
import { useCallback, useEffect, useState, useTransition } from "react";
import { PageHeader } from "~/components/page-header";
import { useDashboardStore } from "~/zustand/store";
import { CustomersTable } from "./customers-table/table";
import debounce from "lodash.debounce";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import type { Customer } from "@blazell/validators/client";
import { isString } from "remeda";

export default function CustomersPage() {
	const customers = useDashboardStore((state) => state.customers);
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [searchResults, setSearchResults] = useState<Customer[] | undefined>(
		undefined,
	);
	const [_, startTransition] = useTransition();
	const createCustomer = useCallback(async () => {
		// await dashboardRep?.mutate.createOrder({
		// });
	}, []);

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
		<main className="w-full p-4 md:px-10 md:py-6 flex justify-center">
			<div className="justify-center flex flex-col lg:flex-row gap-6 w-full max-w-7xl">
				<section className="w-full ">
					<div className="flex flex-col pb-4">
						<PageHeader
							title="Customers"
							className="justify-center md:justify-start"
						/>
						<div className="flex gap-4">
							<Stat description="This month" number={200} />
						</div>
					</div>
					<div className="flex w-full gap-6 flex-col lg:flex-row">
						<div className="w-full lg:w-8/12">
							<CustomersTable
								customers={searchResults ?? customers ?? []}
								createCustomer={createCustomer}
								onSearch={onSearch}
							/>
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

function Stat({
	description,
	number,
}: { description: string; number: number }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardDescription>{description}</CardDescription>
				<CardTitle className="text-4xl">+{number}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-xs text-muted-foreground">+25% from last </div>
			</CardContent>
			<CardFooter className="pt-2">
				<Progress value={25} aria-label="25% increase" />
			</CardFooter>
		</Card>
	);
}
function CustomersInfo() {
	const customers = useDashboardStore((state) => state.customers);
	const isInitialized = useDashboardStore((state) => state.isInitialized);
	return (
		<Card className="w-full max-w-sm min-w-[320px] sticky top-10 shadow-none p-0">
			<CardHeader className="p-4 border-b border-border">
				<CardTitle className="font-freeman">New customers</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 min-h-[40vh] p-4">
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
								{customer.username ?? customer.fullName}
							</p>
							<p className="text-sm text-muted-foreground">{customer.email}</p>
						</div>
						<div className="ml-auto font-medium">+$1,999.00</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
