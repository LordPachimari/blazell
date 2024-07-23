import {
	CreateProductOptionSchema,
	DeleteProductOptionSchema,
	UpdateProductOptionSchema,
} from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const createProductOption = zod(CreateProductOptionSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;

		const { option, optionValues } = input;

		yield* Effect.all(
			[
				tableMutator.set(option, "productOptions"),
				tableMutator.update(option.productID, {}, "products"),
			],
			{
				concurrency: 2,
			},
		);
		if (optionValues) {
			yield* tableMutator.set(optionValues, "productOptionValues");
		}
	}),
);

const updateProductOption = zod(UpdateProductOptionSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { optionID, updates, productID } = input;

		const productOptionUpdate = tableMutator.update(
			optionID,
			updates,
			"productOptions",
		);
		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* Effect.all([productOptionUpdate, productUpdate], {
			concurrency: 2,
		});
	}),
);

const deleteProductOption = zod(DeleteProductOptionSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { optionID, productID } = input;

		const productOptionDelete = tableMutator.delete(optionID, "productOptions");
		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* Effect.all([productOptionDelete, productUpdate], {
			concurrency: 2,
		});
	}),
);
export { createProductOption, updateProductOption, deleteProductOption };
