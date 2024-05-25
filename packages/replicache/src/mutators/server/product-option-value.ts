import { Database } from "@blazell/shared";
import {
	AssignOptionValueToVariantSchema,
	DeleteProductOptionValueSchema,
	NeonDatabaseError,
	NotFound,
	UpdateProductOptionValuesSchema,
} from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const updateProductOptionValues = zod(
	UpdateProductOptionValuesSchema,
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { manager } = yield* Database;
			const { optionID, newOptionValues, productID } = input;
			const option = yield* Effect.tryPromise(() =>
				manager.query.productOptions.findFirst({
					where: (productOptions, { eq }) => eq(productOptions.id, optionID),
					with: {
						optionValues: true,
					},
				}),
			).pipe(
				Effect.catchTags({
					UnknownException: (error) =>
						new NeonDatabaseError({ message: error.message }),
				}),
			);

			if (!option) {
				return yield* Effect.fail(
					new NotFound({ message: "Option not found" }),
				);
			}

			const oldValuesKeys = option.optionValues?.map((value) => value.id) ?? [];

			const setOptionValues = tableMutator.set(
				newOptionValues,
				"productOptionValues",
			);

			const updateProduct = tableMutator.update(productID, {}, "products");
			const effects = [setOptionValues, updateProduct];
			oldValuesKeys.length > 0 &&
				effects.push(tableMutator.delete(oldValuesKeys, "productOptionValues"));

			return yield* Effect.all(effects, {
				concurrency: 3,
			});
		}),
);

const deleteProductOptionValue = zod(DeleteProductOptionValueSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { optionValueID, productID } = input;

		const productOptionValueDelete = tableMutator.delete(
			optionValueID,
			"productOptionValues",
		);

		const productUpdate = tableMutator.update(productID, {}, "products");

		return yield* Effect.all([productOptionValueDelete, productUpdate], {
			concurrency: 2,
		});
	}),
);

const assignOptionValueToVariant = zod(
	AssignOptionValueToVariantSchema,
	(input) =>
		Effect.gen(function* () {
			const tableMutator = yield* TableMutator;
			const { optionValueID, variantID, prevOptionValueID } = input;

			const setRelationship = tableMutator.set(
				{ optionValueID, variantID, id: optionValueID },
				"productOptionValuesToVariants",
			);
			const updateVariant = tableMutator.update(variantID, {}, "variants");
			const effects = [setRelationship, updateVariant];

			if (prevOptionValueID)
				effects.push(
					tableMutator.delete(
						prevOptionValueID,
						"productOptionValuesToVariants",
					),
				);

			return yield* Effect.all(effects, { concurrency: 3 });
		}),
);
export {
	updateProductOptionValues,
	deleteProductOptionValue,
	assignOptionValueToVariant,
};
