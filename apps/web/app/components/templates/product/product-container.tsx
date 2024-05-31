import { cn } from "@blazell/ui";

function ProductContainer(props: React.HtmlHTMLAttributes<HTMLDivElement>) {
	return (
		<aside
			{...props}
			className={cn(
				"bg-white lg:mt-0 dark:bg-mauve-3 w-full lg:bg-transparent col-span-4 lg:col-span-3 lg:border-none p-4 rounded-t-lg z-40",
			)}
		/>
	);
}

export { ProductContainer };
