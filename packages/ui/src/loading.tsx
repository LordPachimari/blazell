import { cn } from ".";
import { Icons, strokeWidth } from "./icons";

export const LoadingSpinner = ({ className }: { className?: string }) => {
	return (
		<Icons.loader
			className={cn("animate-spin text-crimson-9", className)}
			strokeWidth={strokeWidth}
			aria-hidden="true"
		/>
	);
};
