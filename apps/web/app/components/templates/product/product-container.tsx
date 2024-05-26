import { cn } from "@blazell/ui";

function ProductContainer(props: React.HtmlHTMLAttributes<HTMLDivElement>) {
	return (
		<aside
			{...props}
			className={cn(
				"sticky bg-white dark:bg-mauve-3 lg:bg-transparent lg:dark:bg-transparent border-mauve-6 top-10 col-span-4 md:col-span-3 flex-col lg:border-none p-4 rounded-t-2xl lg:h-screen z-40 border ",
			)}
		/>
	);
}

export { ProductContainer };
