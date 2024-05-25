import { toast as sonnerToast } from "sonner";
import { Icons } from "./icons";

const toast = {
	success(message: string) {
		return sonnerToast.success(message, {
			icon: <Icons.circleCheck className="text-jade-9" />,
		});
	},
	error(message: string) {
		return sonnerToast.error(message, {
			icon: <Icons.circleError className="text-ruby-9" />,
		});
	},
	info(message: string) {
		return sonnerToast.info(message, {
			icon: <Icons.circleInfo className="text-sapphire-9" />,
		});
	},
};

export { toast };
