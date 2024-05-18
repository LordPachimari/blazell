import { Effect } from "effect";

import { CreateLineItemSchema, UpdateLineItemSchema } from "@pachi/validators";
import { TableMutator } from "../../../context";
import { zod } from "../../../util/zod";
import { z } from "zod";

const createLineItem = zod(CreateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { lineItem } = input;
		return yield* tableMutator.set(lineItem, "lineItems");
	}),
);

const updateLineItem = zod(UpdateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { quantity, id } = input;
		return yield* tableMutator.update(id, { quantity }, "lineItems");
	}),
);
const deleteLineItem = zod(z.object({ id: z.string() }), (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { id } = input;
		return yield* tableMutator.delete(id, "lineItems");
	}),
);
export { createLineItem, updateLineItem, deleteLineItem };
