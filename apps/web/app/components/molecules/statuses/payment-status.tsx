import { Badge } from "@blazell/ui/badge";
import type { Order } from "@blazell/validators/client";
export function PaymentStatus({ status }: { status: Order["paymentStatus"] }) {
	return status === "paid" ? (
		<Badge
			variant={"outline"}
			className="bg-jade-3 border-jade-9 text-jade-9 font-bold h-7"
		>
			Paid
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-mauve-3 border-mauve-9 text-mauve-9 font-medium "
		>
			refunded
		</Badge>
	);
}
