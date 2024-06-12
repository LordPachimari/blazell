import { Button, type ButtonProps } from "@blazell/ui/button";
import { Icons } from "@blazell/ui/icons";
import * as React from "react";

export function CopyButton({ value, ...props }: ButtonProps) {
	const [isCopied, setIsCopied] = React.useState(false);

	return (
		<Button
			variant="outline"
			type="button"
			size="sm"
			className="absolute right-5 top-4 z-20 h-6 w-6 px-0"
			onClick={() => {
				if (typeof window === "undefined") return;
				setIsCopied(true);
				void window.navigator.clipboard.writeText(value?.toString() ?? "");
				setTimeout(() => setIsCopied(false), 2000);
			}}
			{...props}
		>
			{isCopied ? (
				<Icons.CopyCheck className="h-3 w-3" aria-hidden="true" />
			) : (
				<Icons.Copy className="h-3 w-3" aria-hidden="true" />
			)}
			<span className="sr-only">
				{isCopied ? "Copied" : "Copy to clipboard"}
			</span>
		</Button>
	);
}
