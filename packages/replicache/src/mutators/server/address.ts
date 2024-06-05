import { UpdateAddressSchema } from "@blazell/validators";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

const updateAddress = zod(UpdateAddressSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { updates, id } = input;

		return yield* tableMutator.update(id, updates, "addresses");
	}),
);
export { updateAddress };
