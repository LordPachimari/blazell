import { invariant } from "@epic-web/invariant";
import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
	const data = useRouteLoaderData<RootLoaderData>("root");
	invariant(data?.requestInfo, "No requestInfo found in root loader");

	return data.requestInfo;
}
