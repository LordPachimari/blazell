import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";
import { CartSheet } from "../cart/cart-sheet";
import { Link } from "@remix-run/react";
import { buttonVariants } from "@blazell/ui/button";
import { Logo } from "~/components/molecules/logo";
import type { User } from "@blazell/validators/client";

function Header({
	authID,
	cartID,
	user,
}: {
	authID: string | null;
	cartID: string | null | undefined;
	user: User | undefined;
}) {
	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo to="/" className="absolute  left-1/2 flex -translate-x-1/2" />

			{/* Right corner */}
			<div className="hidden gap-6 sm:flex items-center ">
				<ThemeToggle />
				<CartSheet cartID={cartID} />
				{/* <CartToggle /> */}
				<Link
					to={!authID ? "/sign-in" : !user?.id ? "/create-user" : "/dashboard"}
					className={buttonVariants()}
				>
					Dashboard
				</Link>
			</div>
		</Navbar>
	);
}

export { Header };
