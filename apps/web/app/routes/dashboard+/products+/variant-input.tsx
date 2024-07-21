import { cn } from "@blazell/ui";
import { Badge } from "@blazell/ui/badge";
import { Ping } from "@blazell/ui/ping";
import { VariantSchema, type UpdateVariant } from "@blazell/validators";
import type { Product, Variant } from "@blazell/validators/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { z } from "zod";
import { Attributes } from "./input/product-attributes";
import { Media } from "./input/product-media";
import { Organize } from "./input/product-organize";
import { Pricing } from "./input/product-pricing";
import Stock from "./input/product-stock";

interface ProductVariantProps {
	variant: Variant | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
	product: Product | undefined;
}
const schema = VariantSchema.pick({
	title: true,
	handle: true,
	description: true,
});
type VariantInputType = z.infer<typeof schema>;

const VariantInput = ({
	variant,
	product,
	updateVariant,
}: ProductVariantProps) => {
	const methods = useForm<VariantInputType>({
		resolver: zodResolver(schema),
	});
	const onSubmit: SubmitHandler<
		Pick<Variant, "title" | "description" | "handle">
	> = (data) => {
		console.log("data", data);
	};
	return (
		<form
			className="w-full flex justify-center"
			onSubmit={methods.handleSubmit(onSubmit)}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
				}
			}}
		>
			<main className="relative flex flex-col min-h-screen pb-20 max-w-7xl w-full gap-3 lg:flex lg:flex-row min-w-[15rem] px-3">
				<div className="w-full flex flex-col lg:min-w-[44rem] xl:max-w-[50rem]">
					<section className="flex items-center justify-between h-16">
						<Badge
							variant="default"
							className={cn(
								"text-sm bg-jade-3 flex gap-2 text-jade-9 border-jade-5 sm:ml-0 h-8",
								{
									"bg-red-3 text-red-9 border-red-5":
										(variant?.quantity ?? 0) <= 0,
								},
							)}
						>
							<Ping
								className={cn("bg-jade-9", {
									"bg-red-9": (variant?.quantity ?? 0) <= 0,
								})}
							/>
							{(variant?.quantity ?? 0) > 0 ? "In stock" : "Out of stock"}
						</Badge>
					</section>
					<section className="w-full flex flex-col gap-3">
						<Media images={variant?.images ?? []} variantID={variant?.id} />
						<Stock variant={variant} updateVariant={updateVariant} />
					</section>
				</div>

				<div className="w-full flex flex-col lg:max-w-[25rem]">
					<section className="flex flex-col gap-3 order-2 w-full">
						<Pricing
							isPublished={product?.status === "published"}
							variantID={variant?.id}
							prices={variant?.prices ?? []}
						/>
						<Organize product={product} />
						<Attributes variant={variant} />
					</section>
				</div>
			</main>
		</form>
	);
};
export { VariantInput };
