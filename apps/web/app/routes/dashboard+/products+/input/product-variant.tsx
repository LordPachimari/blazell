import { Button } from "@blazell/ui/button";
import { Drawer, DrawerContent } from "@blazell/ui/drawer";
import { Icons, strokeWidth } from "@blazell/ui/icons";
import { ScrollArea } from "@blazell/ui/scroll-area";
import type { UpdateVariant } from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
import { useCallback } from "react";
import { useReplicache } from "~/zustand/replicache";
import { useDashboardStore } from "~/zustand/store";
import { VariantInput } from "../variant-input";

interface ProductVariantProps {
	setIsOpen: (value: boolean) => void;
	isOpen: boolean;
	variantID: string | null;
	product: Product | undefined;
	setVariantID: (id: string | null) => void;
}

export default function ProductVariant({
	isOpen,
	setIsOpen,
	variantID,
	product,
	setVariantID,
}: Readonly<ProductVariantProps>) {
	const rep = useReplicache((state) => state.dashboardRep);
	const variantMap = useDashboardStore((state) => state.variantMap);
	const variant = variantMap.get(variantID ?? "");

	const updateVariant = useCallback(
		async (props: UpdateVariant) => {
			if (rep) {
				await rep.mutate.updateVariant({
					id: props.id,
					updates: props.updates,
				});
			}
		},
		[rep],
	);

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerContent className="mt-3 flex w-full items-center pt-4 gap-0">
				<Button
					type="button"
					variant={"ghost"}
					size="icon"
					className="hidden lg:flex absolute top-4 right-4"
					onClick={() => setVariantID(null)}
				>
					<Icons.Close size={20} strokeWidth={strokeWidth} />
				</Button>
				<div className="w-full flex justify-center">
					<ScrollArea className="h-[85vh]	 w-full lg:p-6 py-2">
						<VariantInput
							product={product}
							variant={variant}
							updateVariant={updateVariant}
						/>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
