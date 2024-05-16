function ErrorText({
	state = "neutral",
	stateText,
}: {
	state?: "error" | "neutral" | undefined | null;
	stateText?: string | undefined;
}) {
	return state === "neutral" ? null : (
		<span className="block fixed text-start text-xs text-rose-500">
			{stateText}
		</span>
	);
}

export { ErrorText };
