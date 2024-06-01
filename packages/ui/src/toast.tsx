import { toast as sonnerToast } from "sonner";
import { Icons } from "./icons";
import { LoadingSpinner } from "./loading";

const toast = {
	success(message: string) {
		return sonnerToast.success(message, {
			icon: <Icons.circleCheck className="text-jade-9" />,
		});
	},
	error(message: string) {
		return sonnerToast.error(message, {
			icon: <Icons.circleError className="text-ruby-9" />,
			duration: 5000,
			dismissible: true,
			closeButton: true,
		});
	},
	info(message: string) {
		return sonnerToast.info(message, {
			icon: <Icons.circleInfo className="text-sapphire-9" />,
		});
	},
	promise(message: string, promise: Promise<any>) {
		return sonnerToast.promise(promise, {
			loading: <LoadingSpinner />,
			success: () => {
				return (
					<span className="flex items-center gap-2">
						<Icons.circleCheck className="text-jade-9" />
						{message}
					</span>
				);
			},
			error: (
				<span className="flex items-center gap-2">
					<Icons.circleError className="text-ruby-9" />
					Error
				</span>
			),
		});
	},
};

export { toast };
