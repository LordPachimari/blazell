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
import type { Customer } from "@blazell/validators/client";
import { useCallback } from "react";
import { PageHeader } from "~/components/page-header";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { CustomersTable } from "./customers-table/table";
import { Skeleton } from "@blazell/ui/skeleton";
import { useDashboardState } from "~/zustand/state";

export default function CustomersPage() {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const customers = ReplicacheStore.scan<Customer>(dashboardRep, "user");
	const createCustomer = useCallback(async () => {
		// await dashboardRep?.mutate.createOrder({
		// });
	}, []);
	return (
		<main className="w-full p-4 md:p-10 justify-center flex flex-col lg:flex-row gap-6">
			<section className="w-full">
				<div className="flex flex-col pb-4">
					<PageHeader title="Customers" />
					<div className="flex gap-4">
						<Stat description="This month" number={200} />
					</div>
				</div>
				<div className="flex w-full gap-4 flex-col lg:flex-row">
					<div className="w-full lg:w-8/12">
						<CustomersTable
							customers={customers ?? []}
							createCustomer={createCustomer}
						/>
					</div>
					<div className="w-full lg:w-4/12 lg:block hidden">
						<CustomersInfo />
					</div>
				</div>
			</section>
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
	const isInitialized = useDashboardState((state) => state.isInitialized);
	const customers = useDashboardState((state) => state.customers);
	return (
		<Card className="min-w-[24rem]">
			<CardHeader className="pb-4">
				<CardTitle>New customers</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 min-h-[40vh]">
				{!isInitialized &&
					Array.from({ length: 5 }).map((_, i) => (
						<div className="flex items-center gap-4" key={i}>
							<Skeleton className="hidden h-9 w-9 rounded-full sm:flex" />
							<div className="grid gap-1">
								<Skeleton className="w-[150px] h-[10px]" />
							</div>

							<Skeleton className="w-[100px] h-[10px]" />
						</div>
					))}
				{customers.map((customer) => (
					<div className="flex items-center gap-4" key={customer.id}>
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
