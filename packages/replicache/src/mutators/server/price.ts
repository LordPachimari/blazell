import {
	CreatePricesSchema,
	DeletePricesSchema,
	UpdatePriceSchema,
} from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const createPrices = zod(CreatePricesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { prices, id } = input;
		const isVariant = id.startsWith("variant") || id.startsWith("default_var");
		const effects = [];
		effects.push(tableMutator.set(prices, "prices"));

		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* Effect.all(effects, {
			concurrency: 2,
		});
	}),
);

const updatePrice = zod(UpdatePriceSchema, (input) =>
	Effect.gen(function* (_) {
		const tableMutator = yield* TableMutator;
		const { priceID, updates, id } = input;

		const isVariant = id.startsWith("variant") || id.startsWith("default_var");

		const effects = [tableMutator.update(priceID, updates, "prices")];

		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* Effect.all(effects, {
			concurrency: 2,
		});
	}),
);

const deletePrices = zod(DeletePricesSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { priceIDs, id } = input;

		const isVariant = id.startsWith("variant") || id.startsWith("default_var");

		const effects = [tableMutator.delete(priceIDs, "prices")];
		if (isVariant) effects.push(tableMutator.update(id, {}, "variants"));

		return yield* Effect.all(effects, {
			concurrency: 2,
		});
	}),
);
export { createPrices, updatePrice, deletePrices };
