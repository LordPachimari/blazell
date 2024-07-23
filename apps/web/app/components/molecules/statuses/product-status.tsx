import { Badge } from "@blazell/ui/badge";
import type { Product } from "@blazell/validators/client";

export function ProductStatus({ status }: { status: Product["status"] }) {
	return status === "draft" ? (
		<Badge
			variant={"outline"}
			className="bg-yellow-3 border-yellow-5 text-yellow-11 font-bold text-sm"
		>
			Draft
		</Badge>
	) : status === "published" ? (
		<Badge
			variant={"outline"}
			className="bg-jade-3 border-jade-5 text-jade-9 font-bold text-sm"
		>
			Published
		</Badge>
	) : (
		<Badge
			variant={"outline"}
			className="bg-slate-3 border-border text-slate-9 font-bold text-sm"
		>
			Draft
		</Badge>
	);
}
