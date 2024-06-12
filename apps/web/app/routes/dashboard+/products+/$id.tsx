import { cn } from "@blazell/ui";
import { Form, useParams, useSearchParams } from "@remix-run/react";
import { useDashboardStore } from "~/zustand/store";
import { ProductInput } from "./product-input";
import { ProductPreview } from "./product-preview";

function ProductRoute() {
	const params = useParams();
	const variantMap = useDashboardStore((state) => state.variantMap);
	const productMap = useDashboardStore((state) => state.productMap);
	const product = productMap.get(params.id!);
	const [searchParams] = useSearchParams();
	const status = product?.status;
	const view = searchParams.get("view")
		? searchParams.get("view")
		: status === "draft"
			? "input"
			: "preview";
	if (!product) {
		return null;
	}

	const defaultVariant = variantMap.get(product.defaultVariantID);

	return (
		<section className="w-full relative flex justify-center ">
			<PreviewTab view={view} />
			{view === "input" ? (
				<ProductInput
					productID={params.id!}
					product={product}
					defaultVariant={defaultVariant}
				/>
			) : (
				<ProductPreview product={product} />
			)}
		</section>
	);
}
export default ProductRoute;
function PreviewTab({
	view,
}: Readonly<{
	view: string | null;
}>) {
	return (
		<Form className="fixed top-0 z-20 mt-4 h-10 w-11/12 bg-component rounded-xl shadow-md md:w-[12rem] dark:mauve-5 backdrop-blur-sm flex items-center justify-between transition-all duration-500 ease-in-out">
			<button
				name="view"
				value="preview"
				type="submit"
				className={cn(
					"cursor-pointer flex h-full rounded-l-xl justify-center items-center w-full border border-mauve-7  hover:bg-mauve-a-2",
					{
						"bg-mauve-3 text-crimson-9": view === "preview",
					},
				)}
			>
				Preview
			</button>
			<button
				name="view"
				value="input"
				type="submit"
				className={cn(
					"cursor-pointer rounded-r-xl flex h-full justify-center items-center w-full border border-mauve-7  hover:bg-mauve-a-2",
					{
						"bg-mauve-3 text-crimson-9": view === "input",
					},
				)}
			>
				Input
			</button>
		</Form>
	);
}
