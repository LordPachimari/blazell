import { Badge } from "@blazell/ui/badge";
import type { Product } from "@blazell/validators/client";

export function ProductStatus({ status }: { status: Product["status"] }) {
	return status === "draft" ? (
		<Badge
			variant={"outline"}
			className="bg-yellow-3 border-yellow-9 text-yellow-11 font-bold"
		>
			Draft
		</Badge>
	) : status === "published" ? (
		<Badge
			variant={"outline"}
			className="bg-jade-3 border-jade-9 text-jade-9 font-bold "
		>
			Published
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-mauve-3 border-mauve-9 text-mauve-9 font-bold"
		>
			Draft
		</Badge>
	);
}
