// import type {
// 	CreatePrices,
// 	CreateProduct,
// 	CreateVariant,
// 	ProductDuplicate,
// } from "@blazell/validators";
// import type { Product } from "@blazell/validators/client";
// import { Effect } from "effect";
// import { generateID, generateReplicachePK } from "./generate";

// const generateProductDuplicates = ({
// 	product,
// }: { product: Product[] }): Effect.Effect<ProductDuplicate[]> =>
// 	Effect.gen(function* () {
// 		const productDuplicates = yield* Effect.forEach(
// 			product,
// 			(product) => generateProductDuplicate({ product }),
// 			{ concurrency: "unbounded" },
// 		);
// 		return yield* Effect.succeed(productDuplicates);
// 	});

// const generateProductDuplicate = ({
// 	product,
// }: { product: Product }): Effect.Effect<ProductDuplicate> =>
// 	Effect.gen(function* () {
// 		const newProductID = generateID({ prefix: "product" });
// 		const newDefaultVariantID = generateID({ prefix: "default_var" });
// 		const newProduct: CreateProduct["product"] = {
// 			...product,
// 			id: newProductID,
// 			status: "draft",
// 			storeID: product.storeID,
// 			replicachePK: generateReplicachePK({
// 				prefix: "product",
// 				filterID: product.storeID,
// 				id: newProductID,
// 			}),
// 			createdAt: new Date().toISOString(),
// 			updatedAt: new Date().toISOString(),
// 			version: 0,
// 			defaultVariantID: newDefaultVariantID,
// 		};
// 		const newPrices: CreatePrices["prices"] = [];
// 		const optionValueIDToVariantIDs: Record<string, string[]> = {};

// 		const newVariants = yield* Effect.forEach(
// 			product.variants ?? [],
// 			(variant) =>
// 				Effect.sync(() => {
// 					for (const optionValue of variant.optionValues ?? []) {
// 						const variantIDs =
// 							optionValueIDToVariantIDs[optionValue.optionValue.id] ?? [];
// 						variantIDs.push(variant.id);
// 						optionValueIDToVariantIDs[optionValue.optionValue.id] = variantIDs;
// 					}
// 					const newVariantID = variant.id.startsWith("default")
// 						? newDefaultVariantID
// 						: generateID({ prefix: "variant" });
// 					for (const price of variant.prices ?? []) {
// 						const newPrice = generateID({ prefix: "price" });
// 						newPrices.push({
// 							...price,
// 							id: newPrice,
// 							replicachePK: generateReplicachePK({
// 								prefix: "price",
// 								filterID: newVariantID,
// 								id: price.id,
// 							}),
// 							variantID: newVariantID,
// 							version: 0,
// 						} satisfies CreatePrices["prices"][0]);
// 					}
// 					return {
// 						...variant,
// 						id: newVariantID,
// 						replicachePK: generateReplicachePK({
// 							prefix: "variant",
// 							filterID: newProduct.id,
// 							id: newVariantID,
// 						}),
// 						productID: newProduct.id,
// 						createdAt: new Date().toISOString(),
// 						updatedAt: new Date().toISOString(),
// 						version: 0,
// 					};
// 				}),
// 			{ concurrency: "unbounded" },
// 		);
// 		return yield* Effect.succeed({
// 			originalProductID: product.id,
// 			product: newProduct,
// 			variants: newVariants as CreateVariant["variant"][],
// 			prices: newPrices,
// 			defaultVariant:
// 		} satisfies ProductDuplicate);
// 	});
