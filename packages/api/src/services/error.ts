import * as Http from "@effect/platform/HttpClient";
import { schema } from "@blazell/db";
import { Database } from "@blazell/shared";
import { generateID } from "@blazell/utils";
import { NeonDatabaseError } from "@blazell/validators";
import type { ClientError } from "@blazell/validators/server";
import { Effect } from "effect";

export const CreateClientError = ({
	title,
	message,
	userID,
	partyKitOrigin,
}: {
	title: string;
	message: string;
	userID: string | undefined;
	partyKitOrigin: string;
}) =>
	Effect.gen(function* () {
		if (!userID) return;
		const { manager } = yield* Database;
		const newErrorID = generateID({ prefix: "error" });
		const newError: ClientError = {
			id: newErrorID,
			createdAt: new Date().toISOString(),
			message,
			title,
			replicachePK: newErrorID,
			userID,
			version: 0,
		};
		yield* Effect.tryPromise(() =>
			manager.insert(schema.clientErrors).values(newError),
		).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					Effect.fail(new NeonDatabaseError({ message: error.message })),
			}),
			Effect.zipLeft(
				Http.request
					.post(`${partyKitOrigin}/parties/main/user`)
					.pipe(
						Http.request.jsonBody(["errors"]),
						Effect.andThen(Http.client.fetch),
						Effect.retry({ times: 3 }),
						Effect.scoped,
					),
			),
		);
	});
