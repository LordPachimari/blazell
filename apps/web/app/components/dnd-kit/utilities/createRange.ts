const defaultInitializer = (index: number) => index;

export function createRange<T = number>(
	length: number,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	initializer: (index: number) => any = defaultInitializer,
): T[] {
	return [...new Array(length)].map((_, index) => initializer(index));
}
