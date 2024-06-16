import { cn } from "@blazell/ui";
import type React from "react";

interface HighlightedTextProps {
	text: string;
	searchTerm: string;
	className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
	text,
	searchTerm,
	className,
}) => {
	if (!searchTerm) {
		return <span className={cn(className)}>{text}</span>;
	}

	const regex = new RegExp(`(${searchTerm})`, "gi");
	const parts = text.split(regex);

	return (
		<span className={cn(className)}>
			{parts.map((part, index) =>
				regex.test(part) ? (
					<span key={index} className="bg-crimson-3 text-crimson-9">
						{part}
					</span>
				) : (
					<span key={index}>{part}</span>
				),
			)}
		</span>
	);
};

export { HighlightedText };
