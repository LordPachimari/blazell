import { Effect } from "effect";

import { UpdateUserSchema, UserInsertSchema } from "@pachi/validators";

import { TableMutator } from "../../../..";
import { zod } from "../../../util/zod";
import { z } from "zod";

const createUser = zod(z.object({ user: UserInsertSchema }), () =>
	Effect.gen(function* (_) {
		return yield* _(Effect.succeed({}));
	}),
);
const updateUser = zod(UpdateUserSchema, (input) =>
	Effect.gen(function* (_) {
		const { username, id } = input;
		const tableMutator = yield* _(TableMutator);

		return yield* _(
			tableMutator.update(id, { ...(username && { username }) }, "users"),
		);
	}),
);

export { createUser, updateUser };
