import { cn } from ".";
import { Icons } from "./icons";

export const LoadingSpinner = ({ className }: { className?: string }) => {
	return (
		<Icons.Loader
			className={cn("animate-spin text-brand-9", className)}
			aria-hidden="true"
			size={40}
		/>
	);
};
