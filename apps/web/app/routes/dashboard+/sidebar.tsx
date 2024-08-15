import { cn } from "@blazell/ui";
import { DialogContent, DialogRoot } from "@blazell/ui/dialog-vaul";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { Link, useLocation } from "@remix-run/react";
import Image from "~/components/molecules/image";
import { useWindowSize } from "~/hooks/use-window-size";
import { useDashboardState } from "~/zustand/state";
import { useDashboardStore } from "~/zustand/store";

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
	const mainPath = pathname.split("/")[2];
	console.log("mainPat", mainPath);

	return (
		<div className="w-full h-full flex relative inset-0">
			<nav
				className={cn(
					"hidden md:flex flex-col px-2 w-44 opacity-0 shadow-sm md:opacity-100 m-1 md:m-0 fixed top-0 rounded-none h-full border-r border-border md:w-40  overflow-hidden md:border-border transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<StoreInfo />
				<ul className="justify-center py-2 items-center flex w-full flex-col gap-2">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];
						console.log("location", location.pathname);
						console.log("href", item.href);
						console.log("true or nah", location.pathname.startsWith(item.href));
						const Nav = location.pathname.startsWith(item.href) ? "div" : Link;

						return (
							<Nav
								to={item.href}
								prefetch="viewport"
								key={item.title}
								className={cn(
									"group relative rounded-md flex h-8 w-full items-center gap-3 px-2 cursor-pointer dark:hover:bg-component hover:bg-slate-3  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-brand-7",
									{
										"bg-component border-b border-b-slate-7 hover:bg-slate-1 dark:hover:bg-border hover:border-t-slate-7 border border-border":
											mainPath === item.title.toLowerCase(),
									},
								)}
							>
								{/* {item.title === "Orders" && (
									<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-brand-9">
										1
									</div>
								)} */}
								<div className="flex justify-center ">
									<Icon
										className={cn(
											mainPath === item.title.toLowerCase()
												? "text-brand-9"
												: "text-slate-11 group-hover:text-brand-9",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</div>
								<span
									className={cn(
										"relative text-sm text-slate-11 font-light",

										mainPath === item.title.toLowerCase()
											? "text-brand-9"
											: "text-slate-11 group-hover:text-brand-9",
									)}
								>
									{item.title}
								</span>
							</Nav>
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
			<DialogContent className="w-72 bg-component m-0 rounded-none">
				<nav className={cn("flex flex-col px-1 w-full ")}>
					<div>
						<StoreInfo />
					</div>
					<ul className="justify-center items-center flex w-full flex-col gap-2 py-2">
						{items.map((item) => {
							const Icon = Icons[item.icon ?? "chevronLeft"];

							return (
								<Link
									to={item.href}
									prefetch="viewport"
									key={item.title}
									onClick={() => setOpened(false)}
									className={cn(
										"group relative rounded-lg flex h-12 lg:8 w-full items-center gap-3 px-2 cursor-pointer dark:hover:bg-component hover:bg-slate-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-brand-7",
										{
											"bg-component hover:bg-slate-1 dark:hover:bg-border hover:border-t-slate-7 border border-border":
												pathname === item.href,
										},
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
													: "text-slate-11 group-hover:text-brand-9",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</div>
									<span
										className={cn(
											"relative text-slate-11 font-light",

											pathname === item.href
												? "text-brand-9"
												: "text-slate-11 group-hover:text-brand-9",
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
	console.log("active", activeStore);
	return (
		<section className="w-full flex items-center gap-2 h-14 border-b border-border border-dashed p-1">
			<div className="h-8 w-8 rounded-md border border-brand-7 flex justify-center items-center">
				{activeStore?.storeImage?.croppedImage?.url ? (
					<Image
						width={28}
						height={28}
						src={activeStore.storeImage.croppedImage.url}
						className="w-7 h-7 rounded-md"
					/>
				) : (
					<div className="h-7 w-7 bg-brand-5 text-brand-9 rounded-md flex justify-center items-center">
						{activeStore?.name[0]}
					</div>
				)}
			</div>
			<h2 className="text-sm">{activeStore?.name ?? "Store"}</h2>
		</section>
	);
};

export default DashboardSidebar;
