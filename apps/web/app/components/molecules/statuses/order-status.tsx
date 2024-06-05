import type { Order } from "@blazell/validators/client";
import { Badge } from "@blazell/ui/badge";

export function OrderStatus({ status }: { status: Order["status"] }) {
	return status === "pending" ? (
		<Badge
			variant={"outline"}
			className="bg-ruby-3 border-ruby-9 font-bold text-ruby-9 "
		>
			Pending
		</Badge>
	) : status === "completed" ? (
		<Badge
			variant={"outline"}
			className="bg-jade-3 border-jade-9 text-jade-9 text-jade-9 font-medium "
		>
			Delivered
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-gray-300 border-gray-500 font-medium "
		>
			Cancelled
		</Badge>
	);
}
