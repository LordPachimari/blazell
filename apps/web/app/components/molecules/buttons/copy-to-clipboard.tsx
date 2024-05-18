import { cn } from "@pachi/ui";
import { Button } from "@pachi/ui/button";
import { Icons } from "@pachi/ui/icons";
import type React from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import useClipboard from "~/hooks/use-clipboard";

interface CopyToClipboardProps {
	value: string;
	displayValue?: string;
	successDuration?: number;
	showValue?: boolean;
	iconSize?: number;
	onCopy?: () => void;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
	value,
	displayValue,
	successDuration = 3000,
	showValue = true,
	iconSize = 20,
	onCopy,
}) => {
	const [isCopied, handleCopy] = useClipboard(value, {
		...(onCopy && { onCopied: onCopy }),
		successDuration: successDuration,
	});

	useEffect(() => {
		if (isCopied) {
			toast.message("Copied!");
		}
	}, [isCopied]);

	return (
		<div className="inter-small-regular text-grey-50 gap-x-xsmall flex items-center">
			<Button
				variant="ghost"
				size="icon"
				type="button"
				className={cn("text-grey-50 p-0", {
					"text-violet-60": isCopied,
				})}
				onClick={handleCopy}
			>
				<Icons.copy size={iconSize} />
			</Button>
			{showValue && (
				<span className="w-full truncate">
					{displayValue ? displayValue : value}
				</span>
			)}
		</div>
	);
};

export default CopyToClipboard;
