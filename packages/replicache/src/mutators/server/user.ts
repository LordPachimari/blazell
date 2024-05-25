import { UserService } from "@blazell/api";
import { CreateUserSchema, UpdateUserSchema } from "@blazell/validators";
import { Effect } from "effect";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

const updateUser = zod(UpdateUserSchema, (input) =>
	Effect.gen(function* () {
		const { updates, id } = input;
		const tableMutator = yield* TableMutator;

		return yield* tableMutator.update(id, { ...updates }, "users");
	}),
);

export { updateUser };
