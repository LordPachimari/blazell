import { cn } from "@blazell/ui";
import { Icons } from "@blazell/ui/icons";
import { Tabs, TabsList, tabsTriggerVariants } from "@blazell/ui/tabs";
import { useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { useDashboardStore } from "~/zustand/store";
import { ProductInput } from "./product-input";
import { ProductPreview } from "./product-preview";

function ProductRoute() {
	const params = useParams();
	const navigate = useNavigate();
	const variantMap = useDashboardStore((state) => state.variantMap);
	const productMap = useDashboardStore((state) => state.productMap);
	const product = productMap.get(params.id!);
	const [view, setView] = useState<"input" | "preview">(
		product?.status === "published" ? "preview" : "input",
	);
	if (!product) {
		return null;
	}

	const defaultVariant = variantMap.get(product.defaultVariantID);

	return (
		<>
			<nav className="w-full h-12  bg-component border-b border-mauve-5 dark:border-mauve-7 backdrop-blur-sm fixed px-2 z-10">
				<div className="w-full relative flex items-center ">
					<button
						type="button"
						className="flex gap-1 items-center text-brand-9 absolute z-20 left-0 cursor-pointer"
						onClick={() => navigate("/dashboard/products")}
					>
						<Icons.Left size={20} className="hidden lg:block" />
						<Icons.ArrowLeft size={20} className="lg:hidden" />
						<p className="hidden lg:block">Back</p>
					</button>
					<PreviewTab view={view} setView={setView} />
				</div>
			</nav>

			<section className="w-full mt-12 relative flex justify-center ">
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
		</>
	);
}

export default ProductRoute;
function PreviewTab({
	view,
	setView,
}: Readonly<{
	view: string | null;
	setView: (value: "preview" | "input") => void;
}>) {
	console.log("view", view);
	return (
		<div className="w-full h-12 flex justify-center relative">
			<Tabs
				defaultValue="products"
				className="h-12 left-0 md:left-1/3 flex md:absolute"
			>
				<TabsList variant="outline" className="h-12">
					<button
						value="preview"
						name="view"
						type="button"
						className={cn(
							"text-black dark:text-white",
							tabsTriggerVariants({ variant: "outline" }),
							{
								"border-b-2 font-bold border-brand-9 text-brand-9":
									view === "preview",
							},
						)}
						onClick={() => setView("preview")}
					>
						Preview
					</button>
					<button
						value="input"
						name="view"
						type="button"
						className={cn(
							"text-black dark:text-white",
							tabsTriggerVariants({ variant: "outline" }),
							{
								"border-b-2 font-bold border-brand-9 text-brand-9":
									view === "input",
							},
						)}
						onClick={() => setView("input")}
					>
						Input
					</button>
				</TabsList>
			</Tabs>
		</div>
	);
}
