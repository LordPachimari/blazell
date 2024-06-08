import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Link } from "@remix-run/react";
import { Logo } from "~/components/molecules/logo";
import { useRequestInfo } from "~/hooks/use-request-info";
import { CartSheet } from "../cart/cart-sheet";
import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";

function Header() {
	const { userContext } = useRequestInfo();
	const { cartID, fakeAuthID } = userContext;
	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo to="/" className="absolute  left-1/2 flex -translate-x-1/2" />

			{/* Right corner */}
			<div className="hidden gap-6 lg:flex items-center ">
				<ThemeToggle />
				<CartSheet cartID={cartID ?? null} />
				<Link
					to={!fakeAuthID ? "/create-user" : "/dashboard"}
					// to={!authID ? "/sign-in" : !user?.id ? "/create-user" : "/dashboard"}
					className={cn("rounded-full", buttonVariants())}
				>
					Dashboard
				</Link>
			</div>
		</Navbar>
	);
}

export { Header };
