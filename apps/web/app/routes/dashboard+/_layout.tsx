import type {
	Customer,
	LineItem,
	Order,
	Product,
	User,
	Variant,
} from "@blazell/validators/client";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type LoaderFunction } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import DashboardSidebar from "./sidebar";
import { useDashboardState } from "~/zustand/state";
import { useEffect } from "react";
import { useReplicache } from "~/zustand/replicache";
import { useSubscribe } from "replicache-react";
export const loader: LoaderFunction = async (args) => {
	const { getToken, userId } = await getAuth(args);
	if (!userId) return redirect("/sign-in");
	const token = await getToken();
	const user = await fetch(`${args.context.env.WORKER_URL}/users`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	}).then((res) => res.json() as Promise<User | undefined>);
	if (!user) {
		return redirect("/create-user");
	}
	return json(user, { headers: { "Cache-Control": "private, s-maxage=3600" } });
};

export default function DashboardLayout() {
	const {
		products,
		customers,
		orders,
		setIsInitialized,
		setCustomers,
		setOrders,
		setProducts,
	} = useDashboardState();
	const dashboardRep = useReplicache((state) => state.dashboardRep);

	useSubscribe(
		dashboardRep,
		async (tx) => {
			const isInitialized = await tx.get<string>("init");
			setIsInitialized(!!isInitialized);
		},
		{ dependencies: [], default: null },
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return dashboardRep?.experimentalWatch(
			(diffs) => {
				for (const diff of diffs) {
					if (diff.op === "add") {
						const newProducts = [
							...products,
							structuredClone(diff.newValue as Product),
						];
						setProducts(newProducts);
					}

					if (diff.op === "change") {
						setProducts(
							products.map((product) => {
								if (product.replicachePK === diff.key) {
									return structuredClone(diff.newValue) as Product;
								}
								return product;
							}),
						);
					}

					if (diff.op === "del") {
						setProducts(
							products.filter(
								(item) =>
									(item as { replicachePK: string }).replicachePK !== diff.key,
							),
						);
					}
				}
			},
			{ prefix: "product", initialValuesInFirstDiff: true },
		);
	}, [dashboardRep]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return dashboardRep?.experimentalWatch(
			(diffs) => {
				for (const diff of diffs) {
					if (diff.op === "add") {
						setOrders([...orders, structuredClone(diff.newValue as Order)]);
					}

					if (diff.op === "change") {
						setOrders(
							orders.map((order) => {
								if (order.replicachePK === diff.key) {
									return structuredClone(diff.newValue) as Order;
								}
								return order;
							}),
						);
					}

					if (diff.op === "del") {
						setOrders(
							orders.filter(
								(item) =>
									(item as { replicachePK: string }).replicachePK !== diff.key,
							),
						);
					}
				}
			},
			{ prefix: "order", initialValuesInFirstDiff: true },
		);
	}, [dashboardRep]);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return dashboardRep?.experimentalWatch(
			(diffs) => {
				for (const diff of diffs) {
					if (diff.op === "add") {
						setCustomers([
							...customers,
							structuredClone(diff.newValue as Customer),
						]);
					}
				}
			},
			{ prefix: "user", initialValuesInFirstDiff: true },
		);
	}, [dashboardRep]);
	return (
		<SidebarLayoutWrapper>
			<DashboardSidebar>
				<main className="md:pl-40 w-full">
					<Outlet />
				</main>
			</DashboardSidebar>
		</SidebarLayoutWrapper>
	);
}
