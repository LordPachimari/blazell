import { parseWithZod } from "@conform-to/zod";
import { ThemeFormSchema } from "@blazell/validators";
import { useFetchers } from "@remix-run/react";
import { useHints } from "~/hooks/use-hints";
import { useRequestInfo } from "~/hooks/use-request-info";
import { cons } from "effect/List";

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
	const hints = useHints();
	const requestInfo = useRequestInfo();
	const optimisticMode = useOptimisticThemeMode();
	if (optimisticMode) {
		return optimisticMode === "system" ? hints.theme : optimisticMode;
	}
	return requestInfo.userPrefs.theme ?? hints.theme;
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers();
	const themeFetcher = fetchers.find(
		(f) => f.formAction === "/action/set-theme",
	);

	if (themeFetcher?.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		});

		if (submission.status === "success") {
			console.log("what", submission.value.theme);
			return submission.value.theme;
		}
	}
}
