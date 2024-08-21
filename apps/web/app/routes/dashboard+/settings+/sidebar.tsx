import { cn } from "@blazell/ui";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { Link, useLocation } from "@remix-run/react";

export type SettingsSidebarItem = {
	title: string;
	href: string;
	icon: keyof typeof Icons;
};

const items: SettingsSidebarItem[] = [
	{
		title: "General",
		href: "/dashboard/settings/general",

		icon: "Store",
	},
	{
		title: "Payment",
		href: "/dashboard/settings/payment",
		icon: "Payment",
	},
];

interface SettingsSidebarProps {
	children: React.ReactNode;
}

const SettingsSidebar = ({ children }: SettingsSidebarProps) => {
	const { pathname } = useLocation();
	const mainPath = pathname.split("/")[3];

	return (
		<div className="w-full h-full flex relative inset-0">
			<nav
				className={cn(
					"hidden md:flex flex-col px-2 w-44 opacity-0 shadow-sm md:opacity-100 md:m-0 fixed top-14 bg-component rounded-none h-full border-r border-border md:w-40  overflow-hidden md:border-border transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<ul className="justify-center py-2 items-center flex w-full flex-col gap-2">
					{items.map((item) => {
						const Icon = Icons[item.icon ?? "chevronLeft"];
						const Nav = pathname.startsWith(item.href) ? "div" : Link;

						return (
							<Nav
								to={item.href}
								prefetch="viewport"
								key={item.title}
								className={cn(
									"group relative rounded-md flex h-8 w-full items-center gap-3 px-2 cursor-pointer dark:hover:bg-component hover:bg-slate-3  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-brand-7",
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
			<div className="relative md:pl-40 w-full ">{children}</div>
		</div>
	);
};
export { SettingsSidebar };
