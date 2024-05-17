import type { User } from "@pachi/validators/client";
import type { SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "~/root";
function isUser(user: User): user is SerializeFrom<typeof rootLoader>["user"] {
	return user && typeof user === "object" && typeof user.id === "string";
}
export function useUser() {
	const data = useRouteLoaderData<typeof rootLoader>("root");
	if (!data || !isUser(data.user)) {
		return undefined;
	}
	return data.user as User | undefined;
}
