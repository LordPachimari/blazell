import { schema } from "@blazell/db";
import { AuthContext, Cloudflare, Database } from "@blazell/shared";
import {
	NeonDatabaseError,
	InsertPaymentProfileSchema,
	StripeError,
} from "@blazell/validators";
import { sql } from "drizzle-orm";
import { Console, Effect } from "effect";
import { z } from "zod";
import { zod } from "../../util/zod";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";

const createPaymentProfile = zod(
	z.object({
		paymentProfile: InsertPaymentProfileSchema,
		provider: z.literal("stripe"),
	}),
	(input) =>
		Effect.gen(function* () {
			const { manager } = yield* Database;
			const { env } = yield* Cloudflare;
			const { authUser } = yield* AuthContext;
			if (!authUser) return;
			const { paymentProfile } = input;

			const { accountID } = yield* HttpClientRequest.post(
				`${env.SERVER_URL}/stripe/account`,
			).pipe(
				HttpClient.fetchOk,
				Effect.flatMap(
					HttpClientResponse.schemaBodyJson(
						Schema.Struct({
							accountID: Schema.String,
						}),
					),
				),
				Effect.scoped,
				Effect.catchAll((error) =>
					Effect.sync(() => {
						console.error(error);
						return { accountID: null };
					}),
				),
			);

			if (!accountID) {
				yield* Console.error("Error creating account in Stripe.");
				return yield* Effect.fail(
					new StripeError({ message: "Error creating accound in Stripe." }),
				);
			}

			yield* Effect.tryPromise(() =>
				manager
					.insert(schema.paymentProfiles)
					//@ts-ignore
					.values({
						...paymentProfile,
						authID: authUser.id,
						stripeAccountID: accountID,
					})
					.onConflictDoUpdate({
						set: {
							stripeAccountID: accountID,
							version: sql`${schema.paymentProfiles.version} + 1`,
						},
						target: schema.paymentProfiles.authID,
					}),
			);

			yield* Effect.tryPromise(() =>
				manager.insert(schema.stripe).values({
					id: accountID,
					createdAt: new Date().toISOString(),
					updatedAt: null,
					isLoading: false,
					paymentProfileID: paymentProfile.id,
					version: 0,
				}),
			);
		}).pipe(
			Effect.catchTags({
				UnknownException: (error) =>
					new NeonDatabaseError({ message: error.message }),
			}),
		),
);

export { createPaymentProfile };
