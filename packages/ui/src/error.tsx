import { cn } from ".";

export const FieldErrorMessage = ({
	message,
}: { message: string | undefined }) => {
	return (
		<div className={cn("hidden", { hidden: !message })}>
			<p className="text-red-9">{message}</p>
		</div>
	);
};
