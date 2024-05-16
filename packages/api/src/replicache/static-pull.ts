import { Clock, Effect, pipe } from "effect";
import type { PatchOperation, PullResponseOKV1 } from "replicache";

import { Cloudflare, Database } from "@pachi/core";
import type { Category, Cookie, PullRequest } from "@pachi/validators";

import { UnknownExceptionLogger } from "@pachi/utils";

import { ulid } from "ulidx";
import { schema } from "@pachi/db";

export const staticPull = ({
	body: pull,
}: {
	body: PullRequest;
}) =>
	Effect.gen(function* (_) {
		yield* _(
			Effect.log("----------------------------------------------------"),
		);

		yield* _(
			Effect.log(`PROCESSING STATIC PULL: ${JSON.stringify(pull, null, "")}`),
		);

		const requestCookie = pull.cookie;
		const start = yield* _(Clock.currentTimeMillis);
		const patch: PatchOperation[] = [];

		// 1: GET STATIC PULL KEY. IF IT EXIST, DO NOTHING, IF DOESNT THEN PULL ALL STATIC DATA
		const staticPullKey = requestCookie?.staticPullKey;
		const newStaticPullKey = ulid();

		const response: PullResponseOKV1 = {
			lastMutationIDChanges: {},
			cookie: {
				...requestCookie,
				order: 0,
				staticPullKey: staticPullKey ?? newStaticPullKey,
			} satisfies Cookie,
			patch,
		};

		if (staticPullKey) {
			yield* _(Effect.log(`pull response ${JSON.stringify(response)}`));

			return response;
		}

		yield* _(Effect.log("Not cached"));
		patch.push({ op: "clear" });
		const getCats = getCategories();
		const [categories] = yield* _(Effect.all([getCats]));
		yield* _(
			Effect.forEach(
				categories,
				(category) =>
					Effect.sync(() =>
						patch.push({
							op: "put",
							key: category.id,
							value: { ...category, parentID: category.parentID ?? "" },
						}),
					),
				{ concurrency: "unbounded" },
			),
		);
		const end = yield* _(Clock.currentTimeMillis);

		yield* _(Effect.log(`pull response ${JSON.stringify(response)}`));

		yield* _(Effect.log(`TOTAL TIME ${end - start}`));

		yield* _(
			Effect.log("----------------------------------------------------"),
		);

		return response;
	});

export const getCategories = () => {
	return Effect.gen(function* (_) {
		const { KV } = yield* _(Cloudflare);
		const { manager } = yield* _(Database);
		const cachedCategories = yield* _(
			Effect.tryPromise(
				() => KV.get("categories", "json") as Promise<Category[]>,
			).pipe(Effect.orDie),
		);
		if (cachedCategories) {
			yield* _(Effect.log("returning cached response"));
			return cachedCategories;
		}
		const categories = yield* _(
			pipe(
				Effect.tryPromise(
					() => manager.select().from(schema.categories) as Promise<Category[]>,
				),
				Effect.orDieWith((e) =>
					UnknownExceptionLogger(e, "ERROR RETRIEVING CATEGORIES CVD"),
				),
			),
		);

		yield* _(
			Effect.tryPromise(() => KV.put("categories", JSON.stringify(categories))),
		);

		return categories;
	});
};
