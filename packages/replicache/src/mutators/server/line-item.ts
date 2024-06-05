import { Effect } from "effect";

import {
	CreateLineItemSchema,
	UpdateLineItemSchema,
} from "@blazell/validators";
import { z } from "zod";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";
import { createCart } from "./carts";

const createLineItem = zod(CreateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { lineItem, newCartID } = input;
		if (newCartID) {
			yield* createCart({
				cart: {
					id: newCartID,
					createdAt: new Date().toISOString(),
					//TODO: get country code
					countryCode: "AU",
					currencyCode: "AUD",
				},
			});
		}
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
