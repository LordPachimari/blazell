import { Effect } from "effect";

import { CreateCartSchema } from "@blazell/validators";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

const createCart = zod(CreateCartSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { cart } = input;
		return yield* tableMutator.set(cart, "carts");
	}),
);

export { createCart };
