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
		<div className="flex items-center h-10 rounded-xl border border-mauve-7 bg-component">
			<Price
				className="bg-brand text-sm flex-none rounded-xl  p-2"
				amount={amount}
				currencyCode={currencyCode}
				currencyCodeClassName="hidden @[275px]/label:inline"
			/>
		</div>
	);
};

export default PriceLabel;
