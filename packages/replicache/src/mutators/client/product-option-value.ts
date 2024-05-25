import type {
	DeleteProductOptionValue,
	UpdateProductOptionValues,
} from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
import type { WriteTransaction } from "replicache";
import { getEntityFromID } from "./util/get-id";
import { productNotFound } from "./product";

async function updateProductOptionValues(
	tx: WriteTransaction,
	input: UpdateProductOptionValues,
) {
	const { optionID, newOptionValues, productID } = input;

	const product = (await getEntityFromID(tx, productID)) as Product | undefined;

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(product.replicachePK, {
		...product,
		options: product.options?.map((option) =>
			option.id === optionID
				? {
						...option,
						optionValues: newOptionValues,
					}
				: option,
		),
	});
}

async function deleteProductOptionValue(
	tx: WriteTransaction,
	input: DeleteProductOptionValue,
) {
	const { optionValueID, productID } = input;

	const product = (await getEntityFromID(tx, productID)) as Product | undefined;

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(product.replicachePK, {
		...product,
		options: product.options?.map((option) =>
			option.id === optionValueID
				? {
						...option,
						optionValues: option.optionValues?.filter(
							(value) => value.id !== optionValueID,
						),
					}
				: option,
		),
	});
}
export { updateProductOptionValues, deleteProductOptionValue };
