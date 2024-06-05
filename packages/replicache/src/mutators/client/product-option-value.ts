import type {
	DeleteProductOptionValue,
	UpdateProductOptionValues,
} from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
import type { WriteTransaction } from "replicache";
import { productNotFound } from "./product";

async function updateProductOptionValues(
	tx: WriteTransaction,
	input: UpdateProductOptionValues,
) {
	const { optionID, newOptionValues, productID } = input;

	const product = await tx.get<Product>(productID);

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(productID, {
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

	const product = await tx.get<Product>(productID);

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(productID, {
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
export { deleteProductOptionValue, updateProductOptionValues };
