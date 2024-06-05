import type { User } from "@blazell/validators/client";
import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";
function isUser(user: User): boolean {
	return user && typeof user === "object" && typeof user.id === "string";
}
export function useUser() {
	const data = useRouteLoaderData<RootLoaderData>("root");
	if (!data?.user || !isUser(data?.user)) {
		return undefined;
	}
	return data?.user as User | undefined;
}
