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
		title: "Appearance",
		href: "/settings/appearance",
		icon: "Customer",
	},
];
const SettingsSidebar = ({ children }: { children: React.ReactNode }) => {
	const { pathname } = useLocation();

	return (
		<div className="w-full h-full flex relative inset-0">
			<nav
				className={cn(
					"hidden md:flex flex-col px-1 w-44 opacity-0 md:opacity-100 m-1 md:m-0 justify-between bg-component fixed h-[calc(100vh-75px)] rounded-lg md:rounded-none border md:h-full lg:border-r lg:border-t-0 lg:border-l-0 lg:border-b-0 border-mauve-5 dark:border-mauve-7   md:w-40  overflow-hidden md:border-r md:border-mauve-5 dark:border-mauve-7    transition-all duration-200 ease-in-out z-20 ",
				)}
			>
				<div>d</div>
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

export { SettingsSidebar };
