import type {
	CreatePrices,
	CreateProduct,
	CreateVariant,
	ProductDuplicate,
} from "@blazell/validators";
import type { Product } from "@blazell/validators/client";
import { Effect } from "effect";
import { generateID, generateReplicachePK } from "./generate";

const generateProductDuplicates = ({
	product,
}: { product: Product[] }): Effect.Effect<ProductDuplicate[]> =>
	Effect.gen(function* () {
		const productDuplicates = yield* Effect.forEach(
			product,
			(product) => generateProductDuplicate({ product }),
			{ concurrency: "unbounded" },
		);
		return yield* Effect.succeed(productDuplicates);
	});

const generateProductDuplicate = ({
	product,
}: { product: Product }): Effect.Effect<ProductDuplicate> =>
	Effect.gen(function* () {});
