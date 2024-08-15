import { Button } from "@blazell/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@blazell/ui/dropdown-menu";
import Image from "./molecules/image";
import { Link, useFetcher } from "@remix-run/react";
import { Icons } from "@blazell/ui/icons";
import { useCallback } from "react";
import type { action } from "~/routes/action+/logout";
import type { AuthUser } from "@blazell/validators";
import { LoadingSpinner } from "@blazell/ui/loading";

export const ProfileDropdown = ({ user }: { user: AuthUser }) => {
	const fetcher = useFetcher<typeof action>();
	const logout = useCallback(() => {
		return fetcher.submit(
			{
				user: null,
			},
			{
				method: "POST",
				action: "/action/logout",
			},
		);
	}, [fetcher]);
	const isLoggingOut = fetcher.state === "submitting";
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="overflow-hidden rounded-lg"
				>
					{isLoggingOut ? (
						<LoadingSpinner className="text-slate-11 size-4" />
					) : (
						<Image
							src={user.avatar ?? undefined}
							width={36}
							height={36}
							alt="Avatar"
							className="overflow-hidden rounded-lg"
						/>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="w-[200px]">
				<Link to="/dashboard" prefetch="intent">
					<DropdownMenuItem className="flex gap-2 ">
						<Icons.Dashboard size={16} /> Dashboard
					</DropdownMenuItem>
				</Link>
				<Link to="/orders" prefetch="intent">
					<DropdownMenuItem className="flex gap-2">
						<Icons.Order size={16} /> Orders
					</DropdownMenuItem>
				</Link>
				<Link to="/settings" prefetch="intent">
					<DropdownMenuItem className="flex gap-2 ">
						<Icons.Settings size={16} /> Settings
					</DropdownMenuItem>
				</Link>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={logout}
					className="flex gap-2 focus:text-red-9 focus:bg-red-2"
				>
					<span className="flex items-center gap-2">
						<Icons.Logout size={16} /> Logout
					</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
