"use client";

import { cn } from "@pachi/ui";

function ProductContainer(props: React.HtmlHTMLAttributes<HTMLDivElement>) {
	return (
		<aside
			{...props}
			className={cn(
				"sticky top-10 col-span-4 md:col-span-3 flex-col lg:border-none p-4 rounded-t-2xl lg:h-screen z-40 border ",
			)}
		/>
	);
}

export { ProductContainer };
