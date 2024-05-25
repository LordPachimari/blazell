import { UpdateCartSchema } from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const updateCart = zod(UpdateCartSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { updates, id } = input;

		return yield* tableMutator.update(id, updates, "carts");
	}),
);
export { updateCart };
