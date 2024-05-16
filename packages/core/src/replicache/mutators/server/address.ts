import { UpdateAddressSchema } from "@pachi/validators";
import { Effect } from "effect";
import { TableMutator } from "../../../context";
import { zod } from "../../../util/zod";

const updateAddress = zod(UpdateAddressSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* _(TableMutator);
		const { updates, id } = input;

		return yield* _(tableMutator.update(id, updates, "addresses"));
	}),
);
export { updateAddress };
