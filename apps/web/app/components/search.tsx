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
import type { Variant } from "@blazell/validators/client";
import {
	Dialog,
	DialogPanel,
	Input,
	Transition,
	TransitionChild,
} from "@headlessui/react";
import { useLocation, useNavigate } from "@remix-run/react";
import { isString } from "remeda";
import { HighlightedText } from "~/components/molecules/highlighted-text";
import { useDebounce } from "~/hooks/use-debounce";
import type {
	SearchWorkerRequest,
	SearchWorkerResponse,
} from "~/worker/search";
import { useGlobalSearch } from "~/zustand/store";

export function GlobalSearchCombobox() {
	const navigate = useNavigate();
	const searchWorker = useGlobalSearch((state) => state.globalSearchWorker);

	const [query, setQuery] = React.useState("");
	const debouncedQuery = useDebounce(query, 300);
	const [searchResults, setSearchResults] = React.useState<
		{ variants: Variant[] } | undefined
	>(undefined);
	const [loading, __] = React.useState(false);
	const [_, startTransition] = React.useTransition();
	const [isOpen, setIsOpen] = React.useState(false);
	const location = useLocation();
	const splitPath = location.pathname.split("/");
	const mainPath = splitPath[1];

	function open() {
		setIsOpen(true);
	}

	function close() {
		setQuery("");
		setIsOpen(false);
	}

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "k" &&
				(e.metaKey || e.ctrlKey) &&
				mainPath !== "dashboard"
			) {
				e.preventDefault();
				setIsOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [mainPath]);

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
			type: "GLOBAL_SEARCH",
			payload: {
				query: debouncedQuery,
			},
		} satisfies SearchWorkerRequest);
	}, [debouncedQuery, searchWorker]);
	React.useEffect(() => {
		if (!searchWorker) return;

		const handleMessage = (event: MessageEvent) => {
			const { type, payload } = event.data as SearchWorkerResponse;
			if (isString(type) && type === "GLOBAL_SEARCH") {
				startTransition(() => {
					const variants: Variant[] = [];
					const variantIDs = new Set<string>();
					for (const p of payload) {
						if (p.id.startsWith("variant")) {
							if (!variantIDs.has(p.id)) {
								variants.push(p as Variant);
								variantIDs.add(p.id);
							}
						}
					}
					setSearchResults({
						variants,
					});
				});
			}
		};

		searchWorker.addEventListener("message", handleMessage);

		return () => {
			searchWorker.removeEventListener("message", handleMessage);
		};
	}, [searchWorker]);

	return (
		<div>
			<Button
				variant={"outline"}
				className={cn("hidden group relative lg:flex gap-1 px-2")}
				onClick={() => open()}
			>
				<Icons.MagnifyingGlassIcon
					aria-hidden="true"
					className="size-5 text-slate-11 "
				/>
				<span className="text-slate-11  font-light">Search</span>
				<span className="sr-only">Search...</span>
				<Kbd title={"Command"} className=" text-slate-11 border-border ">
					{"⌘"} K
				</Kbd>
			</Button>
			<button
				type="button"
				className="flex lg:hidden rounded-full hover:bg-slate-a-2 p-2"
				onClick={() => open()}
			>
				<Icons.MagnifyingGlassIcon className="text-slate-11 hover:text-brand-9 size-6" />
			</button>
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
						<div className="flex min-h-full items-center justify-center p-4">
							<TransitionChild
								enter="ease-out duration-300"
								enterFrom="opacity-0 transform-[scale(95%)]"
								enterTo="opacity-100 transform-[scale(100%)]"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 transform-[scale(100%)]"
								leaveTo="opacity-0 transform-[scale(95%)]"
							>
								<DialogPanel className="w-full md:w-[600px] rounded-lg backdrop-blur-2xl">
									<Command className="rounded-lg border bg-component  shadow-md w-full">
										<Input
											autoFocus
											className="outline-none h-10 border-b bg-component border-border   p-4"
											placeholder="Global search"
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
																						`/marketplace/products/${variant.handle}`,
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
		</div>
	);
}
