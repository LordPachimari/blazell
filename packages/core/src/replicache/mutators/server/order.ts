import { CreateOrderSchema } from "@pachi/validators";
import { zod } from "../../../util/zod";
import { Effect } from "effect";
import { TableMutator } from "../../../context";

const createOrder = zod(CreateOrderSchema, (input) =>
	Effect.gen(function* () {
		const tableMutator = yield* TableMutator;
		const { order } = input;
		return yield* tableMutator.set(order, "orders");
	}),
);
export { createOrder };
