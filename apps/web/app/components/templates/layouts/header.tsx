import { cn } from "@blazell/ui";
import { buttonVariants } from "@blazell/ui/button";
import { Link } from "@remix-run/react";
import { Logo } from "~/components/molecules/logo";
import { useRequestInfo } from "~/hooks/use-request-info";
import { CartSheet } from "../cart/cart-sheet";
import { Navbar } from "./navbar";
import { ThemeToggle } from "./theme-toggle";
import { useWindowSize } from "~/hooks/use-window-size";
import { GlobalSearchCombobox } from "~/components/search";

function Header() {
	const { userContext } = useRequestInfo();
	const { cartID, fakeAuthID } = userContext;
	const windowSize = useWindowSize();
	return (
		<Navbar>
			{/* Left corner */}
			{/* <MobileNavMenu /> */}
			<div />
			<Logo
				to="/"
				className="absolute xl:left-1/2 lg:left-32 left-1/2 flex -translate-x-1/2"
			/>

			{/* Right corner */}
			<div className="hidden gap-3 lg:flex items-center ">
				{windowSize.width > 1024 && <GlobalSearchCombobox />}
				<ThemeToggle />
				<CartSheet cartID={cartID ?? null} />
				<Link
					to={!fakeAuthID ? "/create-user" : "/dashboard"}
					prefetch="viewport"
					// to={!authID ? "/sign-in" : !user?.id ? "/create-user" : "/dashboard"}
					className={cn(buttonVariants(), "rounded-lg")}
				>
					Dashboard
				</Link>
			</div>
		</Navbar>
	);
}

export { Header };
