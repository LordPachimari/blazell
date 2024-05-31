import { Icons, strokeWidth } from "./icons";

export const LoadingSpinner = () => {
	return (
		<Icons.loader
			className="animate-spin text-crimson-9"
			strokeWidth={strokeWidth}
			aria-hidden="true"
		/>
	);
};
