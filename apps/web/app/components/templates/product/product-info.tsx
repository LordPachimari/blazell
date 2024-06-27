import { Avatar, AvatarFallback, AvatarImage } from "@blazell/ui/avatar";
import type { PublishedVariant } from "@blazell/validators";
import type { Variant } from "@blazell/validators/client";
import Price from "~/components/molecules/price";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GeneralInfoProps {
	defaultVariant: Variant | PublishedVariant | undefined | null;
}

function GeneralInfo({ defaultVariant }: GeneralInfoProps) {
	return (
		<section className="flex flex-col ">
			<div className="w-[200px] flex gap-2">
				<Avatar className="h-16 w-16 ">
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
				<Markdown remarkPlugins={[remarkGfm]}>
					{defaultVariant?.description}
				</Markdown>
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
