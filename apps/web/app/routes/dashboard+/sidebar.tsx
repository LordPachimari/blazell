import { cn } from "@blazell/ui";
import { DialogContent, DialogRoot } from "@blazell/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@blazell/ui/select";
import { Link, useLocation } from "@remix-run/react";
import { useWindowSize } from "~/hooks/use-window-size";
import { useDashboardState } from "~/zustand/state";
import { useDashboardStore } from "~/zustand/store";
import { DashboardSearchCombobox } from "./search";

export type DashboardSidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
};

const items: DashboardSidebarItem[] = [
	{
		title: "Store",
		href: "/dashboard/store",

		icon: "Store",
	},
	{
		title: "Products",
		href: "/dashboard/products",
		icon: "Product",
	},
	{
		title: "Orders",
		href: "/dashboard/orders",
		icon: "Billing",
	},
	{
		title: "Customers",
		href: "/dashboard/customers",
		icon: "Customer",
	},
];
interface DashboardSidebarProps {
	children: React.ReactNode;
}
const DashboardSidebar = ({ children }: DashboardSidebarProps) => {
	const { pathname } = useLocation();

	return (
		<div className="w-full h-full flex relative inset-0">
			<nav
				className={cn(
					"hidden md:flex flex-col px-1 w-44 opacity-0 shadow-sm md:opacity-100 m-1 md:m-0 bg-component fixed top-0 rounded-none h-full border-r border-mauve-5 md:w-40  overflow-hidden md:border-border transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<StoreInfo />
				<DashboardSearchCombobox />
				<ul className="justify-center items-center flex w-full flex-col gap-2">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];

						return (
							<Link
								to={item.href}
								prefetch="viewport"
								key={item.title}
								className={cn(
									"group relative rounded-2xl flex h-10 w-full items-center gap-3 px-2 cursor-pointer hover:bg-mauve-a-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
								)}
							>
								{item.title === "Orders" && (
									<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-brand-9">
										1
									</div>
								)}
								<div className="flex justify-center ">
									<Icon
										className={cn(
											pathname === item.href
												? "text-brand-9"
												: "text-mauve-11 group-hover:text-brand-9",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</div>
								<span
									className={cn(
										"relative text-mauve-11 font-light",

										pathname === item.href
											? "text-brand-9"
											: "text-mauve-11 group-hover:text-brand-9",
									)}
								>
									{item.title}
								</span>
							</Link>
						);
					})}
				</ul>
				<div />
				<div />
			</nav>
			{children}
		</div>
	);
};
export const DashboardSidebarMobile = () => {
	const { pathname } = useLocation();
	const opened = useDashboardState((state) => state.opened);
	const setOpened = useDashboardState((state) => state.setOpened);
	const windowSize = useWindowSize(100);
	if (windowSize.width > 768) return null;
	return (
		<DialogRoot
			shouldScaleBackground={true}
			direction="left"
			open={opened}
			onOpenChange={setOpened}
		>
			<DialogContent className="w-44 bg-component m-0 rounded-none rounded-tr-lg rounded-br-lg">
				<nav className={cn("flex flex-col px-1 w-44 ")}>
					<div>
						<StoreInfo />
						<DashboardSearchCombobox />
					</div>
					<ul className="justify-center items-center flex w-full flex-col gap-2 py-6">
						{items.map((item) => {
							const Icon = Icons[item.icon ?? "chevronLeft"];

							return (
								<Link
									to={item.href}
									prefetch="viewport"
									key={item.title}
									className={cn(
										"group relative rounded-2xl flex h-10 w-full items-center gap-3 px-2 cursor-pointer hover:bg-mauve-a-2",
									)}
									onClick={() => setOpened(false)}
								>
									{item.title === "Orders" && (
										<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-brand-9">
											1
										</div>
									)}
									<div className="flex justify-center ">
										<Icon
											className={cn(
												pathname === item.href
													? "text-brand-9"
													: "text-mauve-11 group-hover:text-brand-9",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</div>
									<span
										className={cn(
											"relative text-mauve-11 font-light",

											pathname === item.href
												? "text-brand-9"
												: "text-mauve-11 group-hover:text-brand-9",
										)}
									>
										{item.title}
									</span>
								</Link>
							);
						})}
					</ul>
					<div />
					<div />
				</nav>
			</DialogContent>
		</DialogRoot>
	);
};
const StoreInfo = () => {
	const stores = useDashboardStore((state) => state.stores);
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const activeStore = stores.find((store) => store.id === activeStoreID);
	return (
		<section className="w-full flex items-center flex-col py-4">
			<Select value={activeStore?.name ?? ""}>
				<SelectTrigger className="h-11">
					<SelectValue />
				</SelectTrigger>
				<SelectContent side="top">
					{stores.map((store) => (
						<SelectItem
							className="h-10"
							key={store.name}
							value={`${store.name}`}
						>
							{store.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</section>
	);
};

export default DashboardSidebar;
