import { cn } from "@blazell/ui";
import type { Product } from "@blazell/validators/client";
import { Form, useParams, useSearchParams } from "@remix-run/react";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import { ProductInput } from "./product-input";
import { ProductPreview } from "./product-preview";

function ProductRoute() {
	const params = useParams();
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const product = ReplicacheStore.getByID<Product>(dashboardRep, params.id!);

	const [searchParams] = useSearchParams();
	const view = searchParams.get("view") || "input";

	return (
		<section className="w-full relative flex justify-center ">
			<PreviewTab view={view} />
			{view === "input" ? (
				<ProductInput productID={params.id!} product={product} />
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
		<Form className="fixed top-0 z-30 mt-4 h-10 w-11/12 bg-component rounded-xl shadow-md md:w-[12rem] dark:mauve-5 backdrop-blur-sm flex items-center justify-between transition-all duration-500 ease-in-out">
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
