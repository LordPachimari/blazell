import * as React from "react";

import { cn } from "@blazell/ui";
import { Button } from "@blazell/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@blazell/ui/command";
import { Icons } from "@blazell/ui/icons";
import { Kbd } from "@blazell/ui/kbd";
import { Skeleton } from "@blazell/ui/skeleton";
import type { Customer, Order, Variant } from "@blazell/validators/client";
import {
	Dialog,
	DialogPanel,
	Input,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { useNavigate } from "@remix-run/react";
import { isString } from "remeda";
import { HighlightedText } from "~/components/molecules/highlighted-text";
import { useDebounce } from "~/hooks/use-debounce";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useDashboardStore } from "~/zustand/store";

export function DashboardSearchCombobox() {
	const navigate = useNavigate();
	const searchWorker = useDashboardStore((state) => state.searchWorker);
	const [query, setQuery] = React.useState("");
	const debouncedQuery = useDebounce(query, 300);
	const [searchResults, setSearchResults] = React.useState<
		{ variants: Variant[]; orders: Order[]; customers: Customer[] } | undefined
	>(undefined);
	const [loading, __] = React.useState(false);
	const [_, startTransition] = React.useTransition();
	const [isOpen, setIsOpen] = React.useState(false);

	function open() {
		setIsOpen(true);
	}

	function close() {
		setQuery("");
		setIsOpen(false);
	}

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const onSelect = React.useCallback((callback: () => unknown) => {
		close();
		callback();
	}, []);

	React.useEffect(() => {
		if (debouncedQuery.length <= 0) {
			setSearchResults(undefined);
			return;
		}

		searchWorker?.postMessage({
			type: "DASHBOARD_SEARCH",
			payload: {
				query: debouncedQuery,
			},
		} satisfies SearchWorkerRequest);
	}, [debouncedQuery, searchWorker]);
	React.useEffect(() => {
		if (!searchWorker) return;

		const handleMessage = (event: MessageEvent) => {
			console.log("Message received in React component");
			const { type, payload } = event.data as SearchWorkerResponse;
			console.log("type", type);
			if (isString(type) && type === "DASHBOARD_SEARCH") {
				startTransition(() => {
					const variants: Variant[] = [];
					const customers: Customer[] = [];
					const orders: Order[] = [];
					const variantIDs = new Set<string>();
					const customerIDs = new Set<string>();
					const orderIDs = new Set<string>();
					for (const p of payload) {
						if (p.id.startsWith("variant")) {
							if (!variantIDs.has(p.id)) {
								variants.push(p as Variant);
								variantIDs.add(p.id);
							}
						} else if (p.id.startsWith("user")) {
							if (!customerIDs.has(p.id)) {
								customers.push(p as Customer);
								customerIDs.add(p.id);
							}
						} else if (p.id.startsWith("order")) {
							if (!orderIDs.has(p.id)) {
								orders.push(p as Order);
								orderIDs.add(p.id);
							}
						}
					}
					setSearchResults({
						variants,
						orders,
						customers,
					});
				});
			}
		};

		searchWorker.addEventListener("message", handleMessage);

		// Test the worker
		searchWorker.postMessage({
			type: "DASHBOARD_SEARCH",
			payload: { query: "test" },
		});

		return () => {
			searchWorker.removeEventListener("message", handleMessage);
		};
	}, [searchWorker]);
	console.log("search results", searchResults);

	return (
		<>
			<Button
				variant={"outline"}
				className={cn("group relative flex gap-1 px-2")}
				onClick={() => open()}
			>
				<Icons.MagnifyingGlassIcon
					aria-hidden="true"
					className="size-5 text-slate-11 "
				/>
				<span className="text-slate-11 text-nowrap font-light px-4">
					Dashboard search
				</span>
				<span className="sr-only">Dashboard search...</span>

				<Kbd
					title={"Command"}
					className=" text-slate-11 border-border text-nowrap "
				>
					{"⌘"} K
				</Kbd>
			</Button>

			<Transition appear show={isOpen}>
				<Dialog
					as="div"
					className="relative z-50 focus:outline-none"
					onClose={close}
				>
					<div
						className="fixed inset-0 bg-black/80 dark:bg-zinc-900/80 backdrop-blur-sm"
						aria-hidden="true"
					/>
					<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
						<div className="flex justify-center p-4">
							<TransitionChild
								enter="ease-out duration-300"
								enterFrom="opacity-0 transform-[scale(95%)]"
								enterTo="opacity-100 transform-[scale(100%)]"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 transform-[scale(100%)]"
								leaveTo="opacity-0 transform-[scale(95%)]"
							>
								<DialogPanel className="w-full md:w-[600px] lg:w-[700px] rounded-lg backdrop-blur-2xl">
									<Command className="rounded-lg border bg-component  shadow-md w-full">
										<Input
											autoFocus
											className="outline-none h-10 border-b bg-component border-slate-5 dark:border-slate-7   p-4"
											placeholder="Search in dashboard.."
											value={query}
											onChange={(e) => setQuery(e.target.value)}
										/>
										<CommandList>
											<CommandEmpty
												className={cn(
													loading ? "hidden" : "py-6 text-center text-slate-11",
												)}
											>
												Nothing found.
											</CommandEmpty>
											{loading ? (
												<div className="space-y-1 overflow-hidden px-1 py-2">
													<Skeleton className="h-4 w-10 rounded" />
													<Skeleton className="h-8 rounded-sm" />
													<Skeleton className="h-8 rounded-sm" />
												</div>
											) : (
												<>
													{searchResults &&
														searchResults.variants.length > 0 && (
															<CommandGroup
																key="products"
																className="capitalize"
																heading="Products"
															>
																{searchResults.variants.map((variant) => {
																	return (
																		<CommandItem
																			key={variant.id}
																			className="p-2"
																			value={variant.id}
																			onSelect={() =>
																				onSelect(() =>
																					navigate(
																						`/dashboard/products/${variant.productID}`,
																					),
																				)
																			}
																		>
																			<div className="flex gap-3">
																				<Icons.Product
																					className="size-6 mt-2"
																					aria-hidden="true"
																				/>
																				<div className="flex flex-col">
																					<HighlightedText
																						searchTerm={query}
																						text={variant.title ?? ""}
																						className="font-bold text-base"
																					/>
																					<HighlightedText
																						searchTerm={query}
																						text={variant.description ?? ""}
																						className="line-clamp-2"
																					/>
																				</div>
																			</div>
																		</CommandItem>
																	);
																})}
															</CommandGroup>
														)}
													{searchResults && searchResults.orders.length > 0 && (
														<CommandGroup
															key="orders"
															className="capitalize"
															heading="Orders"
														>
															{searchResults.orders.map((order) => {
																return (
																	<CommandItem
																		key={order.id}
																		value={order.id}
																		onSelect={() =>
																			onSelect(() =>
																				navigate(
																					`/dashboard/orders/${order.id}`,
																				),
																			)
																		}
																	>
																		<div className="flex gap-3">
																			<Icons.Product
																				className="size-6 mt-2"
																				aria-hidden="true"
																			/>
																			<div className="flex flex-col">
																				<HighlightedText
																					searchTerm={query}
																					text={order.id ?? ""}
																					className="font-bold text-base"
																				/>
																				<HighlightedText
																					searchTerm={query}
																					text={order.fullName ?? ""}
																					className="line-clamp-2"
																				/>
																				<HighlightedText
																					searchTerm={query}
																					text={order.email ?? ""}
																					className="line-clamp-2"
																				/>
																			</div>
																		</div>
																	</CommandItem>
																);
															})}
														</CommandGroup>
													)}

													{searchResults &&
														searchResults.customers.length > 0 && (
															<CommandGroup
																key="customers"
																className="capitalize"
																heading="Customers"
															>
																{searchResults.customers.map((customer) => {
																	return (
																		<CommandItem
																			key={customer.id}
																			className="h-9"
																			value={customer.id}
																			onSelect={() =>
																				onSelect(() =>
																					navigate(
																						`/dashboard/customers/${customer.id}`,
																					),
																				)
																			}
																		>
																			<div className="flex gap-3">
																				<Icons.Product
																					className="size-6 mt-2"
																					aria-hidden="true"
																				/>
																				<div className="flex flex-col">
																					<HighlightedText
																						searchTerm={query}
																						text={
																							customer.user?.username ??
																							"Anonym"
																						}
																						className="font-bold text-base"
																					/>
																					<HighlightedText
																						searchTerm={query}
																						text={customer.user?.fullName ?? ""}
																						className="line-clamp-2"
																					/>
																					<HighlightedText
																						searchTerm={query}
																						text={customer.email ?? ""}
																						className="line-clamp-2"
																					/>
																				</div>
																			</div>
																		</CommandItem>
																	);
																})}
															</CommandGroup>
														)}
												</>
											)}
										</CommandList>
									</Command>
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}
