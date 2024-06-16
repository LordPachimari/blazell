import { cn } from "@blazell/ui";
import { Avatar } from "@blazell/ui/avatar";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import type { Store } from "@blazell/validators/client";
import { Link, useLocation } from "@remix-run/react";
import Image from "~/components/molecules/image";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { toImageURL } from "~/utils/helpers";
import { useDashboardState } from "~/zustand/state";
import { useDashboardStore } from "~/zustand/store";
import { DashboardSearchCombobox } from "./search";
import { DialogContent, DialogRoot } from "@blazell/ui/dialog-vaul";
import { useWindowSize } from "~/hooks/use-window-size";

export type DashboardSidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
	items: [];
};

const items: DashboardSidebarItem[] = [
	{
		title: "Stores",
		href: "/dashboard/store",

		icon: "Store",
		items: [],
	},
	{
		title: "Products",
		href: "/dashboard/products",
		icon: "Product",
		items: [],
	},
	{
		title: "Orders",
		href: "/dashboard/orders",
		icon: "Billing",
		items: [],
	},
	{
		title: "Customers",
		href: "/dashboard/customers",
		icon: "Customer",
		items: [],
	},
];
interface DashboardSidebarProps {
	children: React.ReactNode;
}
const DashboardSidebar = ({ children }: DashboardSidebarProps) => {
	const { pathname } = useLocation();

	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");

	return (
		<div className="w-full h-full flex relative inset-0">
			<nav
				className={cn(
					"hidden md:flex flex-col px-1 w-44 opacity-0 md:opacity-100 m-1 md:m-0 justify-between bg-component fixed h-[calc(100vh-75px)] rounded-lg md:rounded-none border md:h-full lg:border-r lg:border-t-0 lg:border-l-0 lg:border-b-0 border-mauve-7 md:w-40  overflow-hidden md:border-r md:border-mauve-7  transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<div>
					<StoreInfo store={store} />
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
							>
								{item.title === "Orders" && (
									<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-crimson-9">
										1
									</div>
								)}
								<div className="flex justify-center ">
									<Icon
										className={cn(
											pathname === item.href
												? "text-crimson-9"
												: "text-mauve-11 group-hover:text-crimson-9",
										)}
										size={20}
										strokeWidth={strokeWidth}
									/>
								</div>
								<span
									className={cn(
										"relative text-mauve-11 font-light",

										pathname === item.href
											? "text-crimson-9"
											: "text-mauve-11 group-hover:text-crimson-9",
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
	const activeStoreID = useDashboardStore((state) => state.activeStoreID);
	const storeMap = useDashboardStore((state) => state.storeMap);
	const store = storeMap.get(activeStoreID ?? "");
	const windowSize = useWindowSize();
	if (windowSize.width > 768) return null;
	return (
		<DialogRoot direction="left" open={opened} onOpenChange={setOpened}>
			<DialogContent
				className="w-44 bg-component h-[calc(100vh-75px)] m-1"
				overlay={false}
			>
				<nav className={cn("flex flex-col px-1 w-44 ")}>
					<div>
						<StoreInfo store={store} />
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
										<div className="absolute top-0 font-extralight text-white text-sm flex items-center justify-center right-0 w-5 h-5 rounded-full bg-crimson-9">
											1
										</div>
									)}
									<div className="flex justify-center ">
										<Icon
											className={cn(
												pathname === item.href
													? "text-crimson-9"
													: "text-mauve-11 group-hover:text-crimson-9",
											)}
											size={20}
											strokeWidth={strokeWidth}
										/>
									</div>
									<span
										className={cn(
											"relative text-mauve-11 font-light",

											pathname === item.href
												? "text-crimson-9"
												: "text-mauve-11 group-hover:text-crimson-9",
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
const StoreInfo = ({ store }: { store: Store | undefined }) => {
	const setOpened = useDashboardState((state) => state.setOpened);
	return (
		<section className="w-full flex items-center flex-col mt-4">
			<Link
				to={"/dashboard/store"}
				className="flex w-fit h-fit flex-col items-center"
				onClick={() => setOpened(false)}
			>
				<Avatar className="border-mauve-7 bg-mauve-3 border aspect-square w-20 h-20">
					{store?.storeImage ? (
						store?.storeImage?.croppedImage?.uploaded ? (
							<Image
								fit="cover"
								src={store?.storeImage.croppedImage?.url}
								alt="header"
								className="rounded-2xl"
								height={50}
								width={50}
							/>
						) : (
							<img
								src={toImageURL(
									store?.storeImage?.croppedImage?.base64,
									store?.storeImage?.croppedImage?.fileType,
								)}
								alt="store"
								className="rounded-2xl object-cover"
							/>
						)
					) : (
						<ImagePlaceholder />
					)}
				</Avatar>
				<h1 className="font-freeman py-2">{store?.name}</h1>
			</Link>
		</section>
	);
};

export default DashboardSidebar;
