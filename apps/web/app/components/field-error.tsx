export const FieldErrorMessage = ({
	message,
}: { message: string | undefined }) => {
	if (!message) return null;
	return <div className="text-ruby-9 text-sm">{message}</div>;
};
