import { Badge } from "@pachi/ui/badge";
import type { Order } from "@pachi/validators/client";
export function PaymentStatus({ status }: { status: Order["paymentStatus"] }) {
	return status === "paid" ? (
		<Badge
			variant={"outline"}
			className="bg-green-300 border-green-500 font-medium "
		>
			paid
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-gray-300 border-gray-500 font-medium "
		>
			refunded
		</Badge>
	);
}
