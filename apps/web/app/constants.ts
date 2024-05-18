export const LUCIA_COOKIE_NAME = "auth_session";
export const ACTIVE_STORE_ID = "active_store_id";

export const noSidebarPaths = new Set([
	"/",
	"/sign-in",
	"/sign-up",
	"/create-user",
]);

export const noHeaderPaths = (pathname: string) => {
	const paths = ["/dashboard"];
	return paths.some((path) => pathname.startsWith(path));
};

export const footerPaths = new Set(["/"]);
