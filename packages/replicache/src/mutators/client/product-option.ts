import type {
	AssignOptionValueToVariant,
	CreateProductOption,
	DeleteProductOption,
	UpdateProductOption,
} from "@blazell/validators";
import type { WriteTransaction } from "replicache";
import { getEntityFromID } from "./util/get-id";
import type {
	Product,
	ProductOptionValue,
	Variant,
} from "@blazell/validators/client";
import { productNotFound } from "./product";
import { variantNotFound } from "./variant";

async function createProductOption(
	tx: WriteTransaction,
	input: CreateProductOption,
) {
	const { option } = input;
	const product = (await getEntityFromID(tx, option.productID)) as
		| Product
		| undefined;

	if (!product) {
		return productNotFound(option.productID);
	}
	const productOptions = product.options ? product.options : [];

	await tx.set(product.replicachePK, {
		...product,
		options: [...productOptions, option],
	});
}

async function updateProductOption(
	tx: WriteTransaction,
	input: UpdateProductOption,
) {
	const { optionID, productID, updates } = input;

	const product = (await getEntityFromID(tx, productID)) as Product | undefined;

	if (!product) {
		return productNotFound(productID);
	}

	await tx.set(product.replicachePK, {
		...product,
		options: product.options?.map((option) =>
			option.id === optionID ? { ...option, ...updates } : option,
		),
	});
}

async function deleteProductOption(
	tx: WriteTransaction,
	input: DeleteProductOption,
) {
	const { optionID, productID } = input;
	const product = (await getEntityFromID(tx, productID)) as Product | undefined;

	if (!product) {
		return productNotFound(productID);
	}
	const options = product.options
		? product.options.filter((option) => option.id !== optionID)
		: [];

	await tx.set(product.replicachePK, {
		...product,
		options,
	});
}

/* ->VARIANT<- option values must have the shape of {optionValue: Client.ProductOptionValue}
due to drizzle's many to many relationship setup */
async function assignOptionValueToVariant(
	tx: WriteTransaction,
	input: AssignOptionValueToVariant,
) {
	const { optionValueID, prevOptionValueID, variantID } = input;

	const product = (await getEntityFromID(tx, input.productID)) as
		| Product
		| undefined;

	const variant = (await getEntityFromID(tx, variantID)) as Variant | undefined;

	if (!product) {
		return productNotFound(input.productID);
	}
	if (!variant) {
		return variantNotFound(variantID);
	}
	let productOptionValue: ProductOptionValue | undefined;

	for (const option of product.options || []) {
		productOptionValue = option.optionValues?.find(
			(value) => value.id === optionValueID,
		);
		if (productOptionValue) break;
	}

	const newOptionValues: { optionValue: ProductOptionValue }[] = [];
	for (const value of variant.optionValues ?? []) {
		if (value.optionValue.id !== prevOptionValueID) {
			newOptionValues.push({ optionValue: value.optionValue });
		}
	}
	if (productOptionValue)
		newOptionValues.push({ optionValue: productOptionValue });

	if (productOptionValue)
		await tx.set(variant.replicachePK, {
			...variant,
			optionValues: newOptionValues,
		});
}

export {
	assignOptionValueToVariant,
	createProductOption,
	deleteProductOption,
	updateProductOption,
};
