import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons } from "@blazell/ui/icons";
import { ScrollArea } from "@blazell/ui/scroll-area";
import type { AuthUser } from "@blazell/validators";
import { Link, useLocation } from "@remix-run/react";
import { Logo } from "~/components/molecules/logo";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { GlobalSearchCombobox } from "~/components/search";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useGlobalStore } from "~/zustand/store";
import { CartSheet } from "../cart/cart-sheet";
import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";
import { useWindowSize } from "~/hooks/use-window-size";

function Header() {
	const { userContext } = useRequestInfo();

	const { authUser, cartID } = userContext;
	const location = useLocation();
	const isRootPage = location.pathname === "/";

	const windowSize = useWindowSize(100);
	if (isRootPage) return null;
	console.log("auth user", authUser);

	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo
				to={authUser ? "/marketplace" : "/"}
				className="absolute left-20 lg:left-40 xl:left-1/2 flex -translate-x-1/2"
			/>

			{/* Right corner */}
			<div className="gap-2 flex items-center ">
				{windowSize.width > 1024 && <GlobalSearchCombobox />}
				<ThemeToggle />
				<Notifications />
				<CartSheet cartID={cartID ?? null} />
				{authUser?.username ? (
					<ProfileDropdown authUser={authUser as AuthUser} />
				) : (
					<Link
						to={
							!authUser
								? "/login"
								: !authUser.username
									? "/onboarding"
									: "/dashboard"
						}
						prefetch="viewport"
						// to={!authID ? "/sign-in" : !user?.id ? "/create-user" : "/dashboard"}
						className={cn(buttonVariants(), "rounded-lg hidden lg:flex")}
					>
						Dashboard
					</Link>
				)}
			</div>
		</Navbar>
	);
}
function Notifications() {
	const notifications = useGlobalStore((state) => state.notifications);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					buttonVariants({ size: "icon", variant: "outline" }),
					"rounded-lg",
				)}
			>
				<Icons.Notification className="w-5 h-5 text-slate-11" />
				<span className="sr-only">Notifications</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="min-w-[300px] block">
				{notifications.length === 0 && (
					<div className="flex flex-col gap-1 mt-4">
						<h2 className="font-bold text-center">You're all caught up.</h2>

						<p className="text-slate-11 text-center text-sm">
							No notifications.
						</p>
					</div>
				)}
				<ScrollArea className="h-56">
					{notifications.map((notification) => (
						<DropdownMenuItem key={notification.id} className="h-14 p-4">
							<div className="flex flex-col gap-2">
								<p className="font-semibold">{notification.title}</p>
								<p className="text-slate-11">{notification.description}</p>
							</div>
						</DropdownMenuItem>
					))}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { Header };
