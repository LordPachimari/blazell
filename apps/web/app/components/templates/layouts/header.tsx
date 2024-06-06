import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";
import { CartSheet } from "../cart/cart-sheet";
import { Link } from "@remix-run/react";
import { buttonVariants } from "@blazell/ui/button";
import { Logo } from "~/components/molecules/logo";
import type { User } from "@blazell/validators/client";
import { cn } from "@blazell/ui";
import { ClientOnly } from "remix-utils/client-only";

function Header({
	authID,
	cartID,
	user,
}: {
	authID: string | null;
	cartID: string | null;
	user: User | undefined;
}) {
	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo to="/" className="absolute  left-1/2 flex -translate-x-1/2" />

			{/* Right corner */}
			<div className="hidden gap-6 lg:flex items-center ">
				<ClientOnly>{() => <ThemeToggle />}</ClientOnly>
				<CartSheet cartID={cartID} />
				<Link
					to={!authID ? "/sign-in" : !user?.id ? "/create-user" : "/dashboard"}
					className={cn("rounded-full", buttonVariants())}
				>
					Dashboard
				</Link>
			</div>
		</Navbar>
	);
}

export { Header };
