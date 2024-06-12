import { cn } from "@blazell/ui";
import Price from "./price";

const PriceLabel = ({
	amount,
	currencyCode,
	size = "md",
	className,
}: {
	amount: number;
	currencyCode: string;
	className?: string;
	size?: "sm" | "md";
} & React.ComponentProps<"div">) => {
	return (
		<div
			className={cn(
				"flex items-center aspect-square rounded-xl border border-mauve-7 bg-component backdrop-blur-sm",
				className,
				{
					"min-h-12": size === "md",
					"min-h-8": size === "sm",
				},
			)}
		>
			<Price
				className=" text-sm md:text-lg font-freeman flex-none text-crimson-9 rounded-xl  p-2"
				amount={amount}
				currencyCode={currencyCode}
				currencyCodeClassName="hidden @[275px]/label:inline"
			/>
		</div>
	);
};

export default PriceLabel;
