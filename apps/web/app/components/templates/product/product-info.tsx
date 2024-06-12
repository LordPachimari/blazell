import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { truncateString } from "@blazell/utils";
import type { PublishedVariant } from "@blazell/validators";
import type {
	Product,
	PublishedProduct,
	Variant,
} from "@blazell/validators/client";
import { useState } from "react";
import Price from "~/components/molecules/price";

interface GeneralInfoProps {
	defaultVariant: Variant | PublishedVariant | undefined | null;
	product: Product | PublishedProduct | undefined;
}

function GeneralInfo({ defaultVariant, product }: GeneralInfoProps) {
	const [isTruncated, setIsTruncated] = useState(true);

	const handleToggle = () => {
		setIsTruncated(!isTruncated);
	};

	const displayText = isTruncated
		? truncateString(product?.description ?? "", 200)
		: product?.description ?? "";
	return (
		<section className="flex flex-col ">
			<div className="w-[200px] flex gap-2">
				<Avatar className="h-16 w-16">
					<AvatarImage src="https://github.com/shadcn.png" />
					<AvatarFallback>N</AvatarFallback>
				</Avatar>
				<div>
					<p className="font-medium text-lg">{"Store name"}</p>
				</div>
			</div>
			<div className="flex flex-col gap-3 py-2">
				<h1 className="font-medium text-xl">{`${
					defaultVariant?.title ?? "Untitled"
				}`}</h1>
				<p>
					{displayText}
					<span
						onClick={handleToggle}
						onKeyDown={handleToggle}
						className="pl-1 underline cursor-pointer bg-transparent transition text-mauve-11"
					>
						{isTruncated ? "Reveal" : "Hide"}
					</span>
				</p>
			</div>

			<Price
				className="text-xl py-4 font-black"
				amount={defaultVariant?.prices?.[0]?.amount ?? 0}
				currencyCode={defaultVariant?.prices?.[0]?.currencyCode ?? "USD"}
			/>
		</section>
	);
}

export { GeneralInfo };
