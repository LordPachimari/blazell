import type { Effect } from "effect";
import type { z, ZodError } from "zod";

import type {
	AuthorizationError,
	ImageUploadError,
	NeonDatabaseError,
	NotFound,
	TableNotFound,
} from "@blazell/validators";
import type { Cloudflare, Database } from "@blazell/shared";
import type { TableMutator } from "../context/table-mutator";

export function zod<Schema extends z.ZodSchema>(
	schema: Schema,
	func: (
		value: z.infer<Schema>,
	) => Effect.Effect<
		void,
		| TableNotFound
		| ZodError
		| AuthorizationError
		| NeonDatabaseError
		| NotFound
		| ImageUploadError,
		TableMutator | Database | Cloudflare
	>,
) {
	const result = (input: z.infer<Schema>) => {
		const parsed = schema.parse(input);

		return func(parsed);
	};

	return result;
}
