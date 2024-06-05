import { Cloudflare } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import type { ClientError } from "@blazell/validators/server";
import { Effect } from "effect";
import { z } from "zod";
import { TableMutator } from "../../context/table-mutator";
import { zod } from "../../util/zod";

const createClientError = zod(
	z.object({ title: z.string(), message: z.string() }),
	(input) =>
		Effect.gen(function* () {
			const { headers } = yield* Cloudflare;
			const { title, message } = input;

			const userID = headers.get("x-user-id");
			const globalID = headers.get("x-global-id");
			const id = userID ?? globalID;
			if (!id) {
				return;
			}
			const errorID = yield* Effect.sync(() => generateID({ prefix: "error" }));
			const clientError: ClientError = {
				id: errorID,
				title,
				message,
				createdAt: new Date().toISOString(),
				userID: id,
				version: 0,
			};
			const tableMutator = yield* TableMutator;
			return yield* tableMutator.set(clientError, "clientErrors");
		}),
);
export { createClientError };
