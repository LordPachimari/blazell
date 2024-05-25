import { CreateOrderSchema } from "@blazell/validators";
import { Effect } from "effect";
import { zod } from "../../util/zod";
import { TableMutator } from "../../context/table-mutator";

const createOrder = zod(CreateOrderSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { order } = input;
		return yield* tableMutator.set(order, "orders");
	}),
);
export { createOrder };
