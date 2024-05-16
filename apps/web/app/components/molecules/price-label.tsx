import Price from "./price";

const PriceLabel = ({
	title,
	amount,
	currencyCode,
}: {
	title: string;
	amount: number;
	currencyCode: string;
}) => {
	return (
		<div className="flex items-center h-10 rounded-full border bg-white/70 p-1 text-xs font-semibold text-black backdrop-blur-md dark:border-neutral-800 dark:bg-black/70 dark:text-white">
			<Price
				className="bg-brand text-sm flex-none rounded-full  p-2"
				amount={amount}
				currencyCode={currencyCode}
				currencyCodeClassName="hidden @[275px]/label:inline"
			/>
		</div>
	);
};

export default PriceLabel;
