import type { Order } from "@blazell/validators/client";
import { Badge } from "@blazell/ui/badge";
import { cn } from "@blazell/ui";

export function OrderStatus({
	status,
	size = "base",
}: { status: Order["status"]; size?: "small" | "base" }) {
	return status === "pending" ? (
		<Badge
			variant={"outline"}
			className={cn("bg-red-3 border-red-9 font-bold text-red-9", {
				"text-sm h-6": size === "small",
			})}
		>
			Pending
		</Badge>
	) : status === "completed" ? (
		<Badge
			variant={"outline"}
			className={cn("bg-jade-3 border-jade-9 text-jade-9 font-medium ", {
				"text-sm h-6": size === "small",
			})}
		>
			Delivered
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className={cn("bg-gray-300 border-gray-500 font-medium ", {
				"text-sm h-6": size === "small",
			})}
		>
			Cancelled
		</Badge>
	);
}
