import {
	CreateVariantSchema,
	DeleteInputSchema,
	UpdateVariantSchema,
} from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";
import { createPrices } from "./price";

const createVariant = zod(CreateVariantSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { variant, prices } = input;

		yield* tableMutator.set(variant, "variants");
		prices && (yield* createPrices({ prices, id: variant.id }));
	}),
);

const deleteVariant = zod(DeleteInputSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id } = input;

		yield* tableMutator.delete(id, "variants");
	}),
);

const updateVariant = zod(UpdateVariantSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id, updates } = input;

		yield* tableMutator.update(id, updates, "variants");
	}),
);
export { createVariant, deleteVariant, updateVariant };
