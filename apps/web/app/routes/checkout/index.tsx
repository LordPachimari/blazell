import { SidebarLayoutWrapper } from "~/components/templates/layouts/sidebar-wrapper";
import { DesktopCheckout } from "./components/desktop";
import { type LoaderFunction, json } from "@remix-run/cloudflare";
import { userContext } from "~/sessions.server";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
	cartID: string | undefined;
};
export const loader: LoaderFunction = async (args) => {
	const cookieHeader = args.request.headers.get("Cookie");
	const userContextCookie = (await userContext.parse(cookieHeader)) || {};

	return json({
		cartID: userContextCookie.cartID,
	});
};

export default function Checkout() {
	const { cartID } = useLoaderData<LoaderData>();
	return (
		<SidebarLayoutWrapper>
			<DesktopCheckout cartID={cartID ?? ""} />
		</SidebarLayoutWrapper>
	);
}
