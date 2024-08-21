import { cn } from "@blazell/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import { Button } from "@blazell/ui/button";
import { truncateString } from "@blazell/utils";
import type { PublishedVariant } from "@blazell/validators";
import type {
	Product,
	PublishedProduct,
	Variant,
} from "@blazell/validators/client";
import { Link } from "@remix-run/react";
import { useState } from "react";
import Price from "~/components/molecules/price";

interface GeneralInfoProps {
	product: Product | PublishedProduct | undefined;
	defaultVariant: Variant | PublishedVariant | undefined | null;
	setView?: (value: "preview" | "input") => void;
	isDashboard?: boolean;
}

function GeneralInfo({
	defaultVariant,
	setView,
	product,
	isDashboard,
}: GeneralInfoProps) {
	const [isTruncated, setIsTruncated] = useState(true);

	const handleToggle = () => {
		setIsTruncated(!isTruncated);
	};

	const displayText = isTruncated
		? truncateString(defaultVariant?.description ?? "", 200)
		: defaultVariant?.description ?? "";
	return (
		<Link
			to={isDashboard ? "/store" : `/stores/${product?.store.name}`}
			className="flex flex-col "
		>
			<div className="w-full flex gap-2">
				<Avatar className="h-16 w-16">
					<AvatarImage src={product?.store.storeImage?.croppedImage?.url} />
					<AvatarFallback>N</AvatarFallback>
				</Avatar>

				<div className="flex gap-2 justify-between w-full">
					<p className="font-medium text-lg">{product?.store.name}</p>
					{setView && (
						<Button
							variant="outline"
							type="button"
							size="md"
							className="sticky top-4 right-4 z-10"
							onClick={async () => {
								setView("input");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									e.stopPropagation();
									setView("input");
								}
							}}
						>
							Edit
						</Button>
					)}
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
						className={cn(
							"pl-1 underline cursor-pointer bg-transparent transition text-slate-11",
							displayText.length < 200 && "hidden",
						)}
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
		</Link>
	);
}

export { GeneralInfo };
