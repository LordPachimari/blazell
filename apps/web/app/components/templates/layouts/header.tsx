import { cn } from "@blazell/ui";
import { Button, buttonVariants } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import { Icons } from "@blazell/ui/icons";
import { ScrollArea } from "@blazell/ui/scroll-area";
import { Link, useLocation } from "@remix-run/react";
import Image from "~/components/molecules/image";
import { Logo } from "~/components/molecules/logo";
import { GlobalSearchCombobox } from "~/components/search";
import { useRequestInfo } from "~/hooks/use-request-info";
import { useGlobalStore } from "~/zustand/store";
import { CartSheet } from "../cart/cart-sheet";
import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";

function Header() {
	const { userContext } = useRequestInfo();
	const { user } = userContext;
	const { cartID, fakeAuthID } = userContext;
	const location = useLocation();
	const isRootPage = location.pathname === "/";
	if (isRootPage) return null;

	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo
				to="/"
				className="absolute left-20 lg:left-40 xl:left-1/2 flex -translate-x-1/2"
			/>

			{/* Right corner */}
			<div className="gap-2 flex items-center ">
				<GlobalSearchCombobox />
				<Notifications />
				<ThemeToggle />
				<CartSheet cartID={cartID ?? null} />
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="overflow-hidden rounded-lg"
							>
								<Image
									src={user.avatar?.url}
									width={36}
									height={36}
									alt="Avatar"
									className="overflow-hidden rounded-lg"
								/>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<Link to="/dashboard" prefetch="intent">
								<DropdownMenuItem>Dashboard</DropdownMenuItem>
							</Link>
							<Link to="/orders" prefetch="intent">
								<DropdownMenuItem>Orders</DropdownMenuItem>
							</Link>
							<Link to="/settings" prefetch="intent">
								<DropdownMenuItem>Settings</DropdownMenuItem>
							</Link>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="focus:text-red-9 font-bold focus:bg-red-2">
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Link
						to={!fakeAuthID ? "/onboarding" : "/dashboard"}
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
					"rounded-full",
				)}
			>
				<Icons.Notification className="w-5 h-5 text-mauve-11" />
				<span className="sr-only">Notifications</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				className="min-w-[300px] hidden lg:block"
			>
				{notifications.length === 0 && (
					<div className="flex flex-col gap-1 mt-4">
						<h2 className="font-bold text-center">You're all caught up.</h2>

						<p className="text-mauve-11 text-center text-sm">
							No notifications.
						</p>
					</div>
				)}
				<ScrollArea className="h-56">
					{notifications.map((notification) => (
						<DropdownMenuItem key={notification.id} className="h-14 p-4">
							<div className="flex flex-col gap-2">
								<p className="font-semibold">{notification.title}</p>
								<p className="text-mauve-11">{notification.description}</p>
							</div>
						</DropdownMenuItem>
					))}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { Header };
