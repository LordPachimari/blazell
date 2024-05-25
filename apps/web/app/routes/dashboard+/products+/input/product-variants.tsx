import { Button } from "@blazell/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@blazell/ui/card";
import { generateID, generateReplicachePK } from "@blazell/utils";
import type { InsertVariant, UpdateVariant } from "@blazell/validators";
import type { ProductOption, Variant } from "@blazell/validators/client";
import { PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ReplicacheStore } from "~/replicache/store";
import { useReplicache } from "~/zustand/replicache";
import VariantTable from "../variant-table/table";
import { ProductOptions } from "./product-options";
import ProductVariant from "./product-variant";
import { useSearchParams } from "@remix-run/react";

interface ProductVariantsProps {
	options: ProductOption[] | undefined;
	productID: string | undefined;
	updateVariant: (props: UpdateVariant) => Promise<void>;
}
export function Variants({
	options,
	productID,
	updateVariant,
}: ProductVariantsProps) {
	const dashboardRep = useReplicache((state) => state.dashboardRep);
	const variants = ReplicacheStore.scan<Variant>(
		dashboardRep,
		`variant_${productID}`,
	);
	const [isOpen, _setIsOpen] = useState(false);
	const setIsOpen = (value: boolean) => {
		value === false && setVariantID(null);
		_setIsOpen(value);
	};

	const [searchParams, setSearchParams] = useSearchParams();
	const setVariantID = (id: string | null) => {
		setSearchParams((prev) => {
			if (!id) {
				prev.delete("variant");
				return prev;
			}
			prev.set("variant", id);
			return prev;
		});
	};
	const variantID = searchParams.get("variant");
	const createVariant = useCallback(async () => {
		if (!productID) return;
		const newID = generateID({ prefix: "variant" });
		const newVariant: InsertVariant = {
			id: newID,
			productID,
			replicachePK: generateReplicachePK({
				id: newID,
				prefix: "variant",
				filterID: productID,
			}),
		};
		await dashboardRep?.mutate.createVariant({
			variant: newVariant,
		});

		setVariantID(newID);
	}, [dashboardRep, productID, setVariantID]);

	const deleteVariant = useCallback(
		async (id: string) => {
			if (dashboardRep) {
				await dashboardRep.mutate.deleteVariant({
					id: id,
				});
			}
		},
		[dashboardRep],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (variantID) setIsOpen(true);
	}, [variantID]);
	return (
		<Card className="my-4">
			<CardHeader>
				<CardTitle>
					<span className="flex w-full justify-between">
						Variant<p className="text-sm text-mauve-9">{"(optional)"}</p>
					</span>
				</CardTitle>
				<CardDescription>
					Create variants of your products based on size, colors etc.
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				{productID && (
					<ProductOptions options={options} productID={productID} />
				)}
				<VariantTable
					setVariantID={setVariantID}
					variants={variants ?? []}
					updateVariant={updateVariant}
					deleteVariant={deleteVariant}
				/>
			</CardContent>
			<CardFooter className="justify-center">
				<Button
					size="md"
					variant="ghost"
					type="button"
					className="mt-2 text-mauve-11"
					onClick={createVariant}
				>
					<PlusCircle className="h-3.5 w-3.5 mr-2" />
					Add Variant
				</Button>
				{productID && (
					<ProductVariant
						isOpen={isOpen}
						options={options ?? []}
						variantID={variantID}
						setIsOpen={setIsOpen}
						productID={productID}
						setVariantID={setVariantID}
					/>
				)}
			</CardFooter>
		</Card>
	);
}
