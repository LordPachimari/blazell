import type { Order } from "@pachi/validators/client";
import { Badge } from "@pachi/ui/badge";

export function OrderStatus({ status }: { status: Order["status"] }) {
	return status === "pending" ? (
		<Badge variant={"outline"} className="bg-ruby-6 border-ruby-9 font-medium ">
			pending
		</Badge>
	) : status === "completed" ? (
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
