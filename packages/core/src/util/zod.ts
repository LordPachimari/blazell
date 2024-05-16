import type { Effect } from "effect";
import type { UnknownException } from "effect/Cause";
import type { z, ZodError } from "zod";

import type { AuthorizationError, NotFound } from "@pachi/validators";

import type { Cloudflare, Database, TableMutator } from "..";

export function zod<Schema extends z.ZodSchema>(
	schema: Schema,
	func: (
		value: z.infer<Schema>,
	) => Effect.Effect<
		void,
		NotFound | ZodError | AuthorizationError | UnknownException,
		TableMutator | Database | Cloudflare
	>,
) {
	const result = (input: z.infer<Schema>) => {
		const parsed = schema.parse(input);

		return func(parsed);
	};

	return result;
}
