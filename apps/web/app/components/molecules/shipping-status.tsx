import { Badge } from "@blazell/ui/badge";
import type { Order } from "@blazell/validators/client";

export function ShippingStatus({
	status,
}: { status: Order["shippingStatus"] }) {
	return status === "pending" ? (
		<Badge
			variant={"outline"}
			className="bg-red-300 border-red-500 font-medium "
		>
			pending
		</Badge>
	) : status === "shipped" ? (
		<Badge
			variant={"outline"}
			className="bg-yellow-300 border-yellow-500 font-medium "
		/>
	) : status === "delivered" ? (
		<Badge
			variant={"outline"}
			className="bg-green-300 border-green-500 font-medium "
		>
			delivered
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-gray-300 border-gray-500 font-medium "
		>
			cancelled
		</Badge>
	);
}
