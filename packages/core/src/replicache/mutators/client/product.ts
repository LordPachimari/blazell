import type { ReadonlyJSONValue, WriteTransaction } from "replicache";

import { generateReplicachePK } from "@pachi/utils";
import type {
	AssignOptionValueToVariant,
	CreateProduct,
	CreateProductOption,
	CreateVariant,
	CreatePrices,
	DeleteInput,
	DeleteProductOption,
	DeleteProductOptionValue,
	DeleteVariant,
	DeleteImage,
	DeletePrices,
	UpdateProduct,
	UpdateProductOption,
	UpdateProductOptionValues,
	UpdateVariant,
	UpdateImagesOrder,
	UpdatePrice,
	UploadImages,
} from "@pachi/validators";
import { isDefined } from "remeda";
import { getEntityFromID } from "./util/get-id";
import type {
	Price,
	Product,
	ProductOptionValue,
	Variant,
} from "@pachi/validators/client";

function productNotFound(id: string) {
	console.info(`Product ${id} not found`);
	throw new Error(`Product ${id} not found`);
}

function variantNotFound(id: string) {
	console.info(`Variant ${id} not found`);
	throw new Error(`Variant ${id} not found`);
}
function entityNotFound(id: string) {
	console.info(`Entity ${id} not found`);
	throw new Error(`Entity ${id} not found`);
}

async function createProduct(tx: WriteTransaction, input: CreateProduct) {
	const { product } = input;

	await tx.set(product.replicachePK, product);
}

async function deleteProduct(tx: WriteTransaction, input: DeleteInput) {
	const { id } = input;
	const product = (await getEntityFromID(tx, id)) as Product | undefined;
	product && (await tx.del(product.replicachePK));
}

async function updateProduct(tx: WriteTransaction, input: UpdateProduct) {
	const { updates, id } = input;
	const product = (await getEntityFromID(tx, id)) as Product | undefined;

	if (!product) {
		return productNotFound(id);
	}
	await tx.set(product.replicachePK, {
		...product,
		...updates,
	});
}

async function publishProduct(tx: WriteTransaction, input: { id: string }) {
	const { id } = input;
	const product = (await getEntityFromID(tx, id)) as Product | undefined;

	if (!product) {
		return productNotFound(id);
	}
	await tx.set(product.replicachePK, {
		...product,
		status: "published",
	});
}

async function updateImagesOrder(
	tx: WriteTransaction,
	input: UpdateImagesOrder,
) {
	const { order, id } = input;

	const entity = (await getEntityFromID(tx, id)) as
		| Product
		| Variant
		| undefined;
	const isProduct = id.startsWith("product");

	if (!entity) {
		return entityNotFound(id);
	}

	const images = entity.images ? structuredClone(entity.images) : [];

	for (const image of images) {
		const o = order[image.id];
		if (isDefined.strict(o)) image.order = o;
	}
	images.sort((a, b) => a.order - b.order);
	return await tx.set(entity.replicachePK, {
		...entity,
		images,
		...(isProduct && { thumbnail: images[0] }),
	});
}

async function uploadImages(tx: WriteTransaction, input: UploadImages) {
	const { id, images } = input;

	const entity = (await getEntityFromID(tx, id)) as
		| Product
		| Variant
		| undefined;
	const isProduct = id.startsWith("product");

	if (!entity) {
		return entityNotFound(id);
	}

	if (images.length === 0) {
		return;
	}

	const updatedImages = [...(entity.images ? entity.images : []), ...images];

	return await tx.set(entity.replicachePK, {
		...entity,
		images: updatedImages,
		...(isProduct && { thumbnail: images[0] }),
	});
}

async function deleteImage(tx: WriteTransaction, input: DeleteImage) {
	const { imageID, id } = input;

	const entity = (await getEntityFromID(tx, id)) as
		| Product
		| Variant
		| undefined;

	if (!entity) {
		return entityNotFound(id);
	}

	await tx.set(entity.replicachePK, {
		...entity,
		images: entity.images?.filter((image) => image.id !== imageID),
	});
}

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

async function createVariant(tx: WriteTransaction, input: CreateVariant) {
	const { variant } = input;

	await tx.set(variant.replicachePK, variant);
}

async function updateVariant(tx: WriteTransaction, input: UpdateVariant) {
	const { updates, id } = input;

	const variant = (await getEntityFromID(tx, id)) as Variant | undefined;

	if (!variant) {
		return variantNotFound(id);
	}
	await tx.set(variant.replicachePK, {
		...variant,
		...updates,
	});
}

async function deleteVariant(tx: WriteTransaction, input: DeleteVariant) {
	const { id } = input;
	const variant = (await getEntityFromID(tx, id)) as Variant | undefined;
	variant && (await tx.del(variant.replicachePK));
}

async function createPrices(tx: WriteTransaction, input: CreatePrices) {
	const { prices, id } = input;

	const entity = (await getEntityFromID(tx, id)) as
		| Product
		| Variant
		| undefined;

	if (!entity) {
		return entityNotFound(id);
	}
	const entityPrices = entity.prices ? [...entity.prices] : [];

	for (const price of prices) {
		entityPrices.push(price as Price);
	}

	await tx.set(entity.replicachePK, {
		...entity,
		prices: entityPrices,
	});
}

async function updatePrice(tx: WriteTransaction, input: UpdatePrice) {
	const { priceID, updates, id } = input;

	const entity = (await getEntityFromID(tx, id)) as
		| Product
		| Variant
		| undefined;

	if (!entity) {
		return entityNotFound(id);
	}

	const entityPrices = entity.prices
		? entity.prices.map((price) => {
				if (price.id === priceID) return { ...price, ...updates };

				return price;
			})
		: [];

	await tx.set(entity.replicachePK, {
		...entity,
		prices: entityPrices,
	});
}

async function deletePrices(tx: WriteTransaction, input: DeletePrices) {
	const { priceIDs, id } = input;

	const entity = (await getEntityFromID(tx, id)) as
		| Product
		| Variant
		| undefined;

	if (!entity) {
		return entityNotFound(id);
	}

	const entityPrices = entity.prices
		? entity.prices.filter((price) => !priceIDs.includes(price.id))
		: [];

	await tx.set(entity.replicachePK, {
		...entity,
		prices: entityPrices,
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
	createProduct,
	createProductOption,
	createVariant,
	createPrices,
	deleteProduct,
	publishProduct,
	deleteProductOption,
	deleteProductOptionValue,
	deleteVariant,
	deletePrices,
	updateProduct,
	updateProductOption,
	updateProductOptionValues,
	updateVariant,
	updateImagesOrder,
	updatePrice,
	uploadImages,
	deleteImage,
};
