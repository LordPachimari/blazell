import { cn } from "@blazell/ui";

export const FieldErrorMessage = ({
	message,
	className,
}: { message: string | undefined; className?: string }) => {
	if (!message) return null;
	return <div className={cn("text-ruby-9 text-sm", className)}>{message}</div>;
};
