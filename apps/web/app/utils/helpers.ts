export function getDomainUrl(request: Request) {
	const host =
		request.headers.get("X-Forwarded-Host") ??
		request.headers.get("host") ??
		new URL(request.url).host;
	const protocol = host.includes("localhost") ? "http" : "https";
	return `${protocol}://${host}`;
}
export function getErrorMessage(error: unknown) {
	if (typeof error === "string") return error;
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}
	console.error("Unable to get error message for error", error);
	return "Unknown Error";
}
