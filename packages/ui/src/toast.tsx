import { toast as sonnerToast } from "sonner";
import { Icons } from "./icons";
import { LoadingSpinner } from "./loading";

const toast = {
	success(message: string) {
		return sonnerToast.success(message, {
			icon: <Icons.CircleCheck className="text-jade-9" />,
		});
	},
	error(message: string) {
		return sonnerToast.error(message, {
			icon: <Icons.CircleError className="text-ruby-9" />,
			duration: 5000,
			dismissible: true,
			closeButton: true,
		});
	},
	info(message: string) {
		return sonnerToast.info(message, {
			icon: <Icons.CircleInfo className="text-sapphire-9" />,
		});
	},
	promise(message: string, promise: Promise<any>, errorMessage?: string) {
		return sonnerToast.promise(promise, {
			loading: <LoadingSpinner />,
			success: () => {
				return (
					<span className="flex items-center gap-2">
						<Icons.CircleCheck className="text-jade-9" />
						{message}
					</span>
				);
			},
			error: (error) => {
				console.error(JSON.stringify(error));

				return (
					<span className="flex items-center gap-2">
						<Icons.CircleError className="text-ruby-9" />
						{errorMessage}
					</span>
				);
			},
			dismissible: true,
		});
	},
	loading(message: string) {
		return sonnerToast.loading(message, {
			icon: <LoadingSpinner />,
		});
	},
};

export { toast };
