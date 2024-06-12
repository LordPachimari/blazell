import { Effect } from "effect";

import {
	CreateLineItemSchema,
	NeonDatabaseError,
	UpdateLineItemSchema,
} from "@blazell/validators";
import { z } from "zod";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";
import { createCart } from "./carts";
import { Database } from "@blazell/shared";

const createLineItem = zod(CreateLineItemSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { manager } = yield* Database;
		const { lineItem, newCartID } = input;
		const product = yield* Effect.tryPromise(() =>
			manager.query.products.findFirst({
				where: (products, { eq }) => eq(products.id, lineItem.productID),
			}),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({
						message: error.message,
					}),
			}),
		);

		//TODO: create a toast for the client
		if (!product || product.status !== "published") {
			return yield* Effect.succeed({});
		}

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
