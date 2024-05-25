import {
	CreateVariantSchema,
	DeleteInputSchema,
	UpdateVariantSchema,
} from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const createVariant = zod(CreateVariantSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { variant } = input;

		return yield* tableMutator.set(variant, "variants");
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

		return yield* tableMutator.update(id, updates, "variants");
	}),
);
export { createVariant, deleteVariant, updateVariant };
