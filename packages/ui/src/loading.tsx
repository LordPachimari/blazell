import { cn } from ".";
import { Icons, strokeWidth } from "./icons";

export const LoadingSpinner = ({ className }: { className?: string }) => {
	return (
		<Icons.Loader
			className={cn("animate-spin text-brand-9", className)}
			strokeWidth={strokeWidth}
			aria-hidden="true"
		/>
	);
};
