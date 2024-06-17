import { Badge } from "@blazell/ui/badge";
import type { Order } from "@blazell/validators/client";

export function ShippingStatus({
	status,
}: { status: Order["shippingStatus"] }) {
	return status === "pending" ? (
		<Badge
			variant={"outline"}
			className="bg-red-3 border-red-9 text-red-9  font-bold"
		>
			Pending
		</Badge>
	) : status === "shipped" ? (
		<Badge
			variant={"outline"}
			className="bg-yellow-2 border-yellow-9 text-yellow-11 font-bold"
		>
			Shipped
		</Badge>
	) : status === "delivered" ? (
		<Badge
			variant={"outline"}
			className="bg-jade-3 border-jade-9 text-jade-9 font-bold "
		>
			Delivered
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-mauve-3 border-mauve-9 text-mauve-9 font-bold"
		>
			Cancelled
		</Badge>
	);
}
