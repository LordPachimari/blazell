import { Effect } from "effect";

import {
	CreateCartSchema,
	CreateLineItemSchema,
	UpdateLineItemSchema,
} from "@blazell/validators";
import { z } from "zod";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const createCart = zod(CreateCartSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { cart } = input;
		return yield* tableMutator.set(cart, "carts");
	}),
);

export { createCart };
