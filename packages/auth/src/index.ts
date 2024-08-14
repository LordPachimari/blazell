import type { AuthSession } from "@blazell/validators";
import {
	HttpClient,
	HttpClientRequest,
	HttpClientResponse,
} from "@effect/platform";
import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
const SessionSchema = Schema.Struct({
	id: Schema.String,
	authID: Schema.String,
	expiresAt: Schema.String,
	createdAt: Schema.String,
});
const UserAndSessionSchema = Schema.Struct({
	user: Schema.NullishOr(
		Schema.Struct({
			id: Schema.String,
			email: Schema.String,
			avatar: Schema.Union(Schema.String, Schema.Null),
			fullName: Schema.Union(Schema.String, Schema.Null),
			username: Schema.Union(Schema.String, Schema.Null),
		}),
	),
	session: Schema.NullishOr(SessionSchema),
});
export const SESSION_KEY = "blazell-session";

export const Authentication = ({
	serverURL,
	sessionExpiresIn = new TimeSpan(30, "d"),
	sessionKey = SESSION_KEY,
}: {
	sessionExpiresIn?: TimeSpan;
	serverURL: string;
	sessionKey?: string;
}) => {
	return {
		sessionKey,
		validateSession: (sessionId: string) => {
			return Effect.runPromise(
				Effect.gen(function* () {
					const { session, user } = yield* HttpClientRequest.get(
						`${serverURL}/api/auth/user-session?sessionID=${sessionId}`,
					).pipe(
						HttpClient.fetchOk,
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(UserAndSessionSchema),
						),
						Effect.scoped,
					);
					if (!session || !user) {
						if (session) {
							yield* HttpClientRequest.del(
								`${serverURL}/api/auth/session/${sessionId}`,
							).pipe(HttpClient.fetchOk, Effect.scoped);
						}
						return { user: null, session: null };
					}

					const expirationDate = new Date(session.expiresAt);
					const activePeriodExpirationDate = new Date(
						expirationDate.getTime() - sessionExpiresIn.milliseconds() / 2,
					);

					if (!isWithinExpirationDate(expirationDate)) {
						yield* HttpClientRequest.del(
							`${serverURL}/api/auth/session/${sessionId}`,
						).pipe(HttpClient.fetchOk, Effect.scoped, Effect.orDie);
						return { user: null, session: null };
					}

					const currentSession: AuthSession = {
						...session,
						fresh: isWithinExpirationDate(activePeriodExpirationDate),
					};

					return { user, session: currentSession };
				}).pipe(
					//TODO: Handle errors
					Effect.orDie,
				),
			);
		},
		createSession: (authID: string) => {
			return Effect.runPromise(
				Effect.gen(function* () {
					const sessionExpiresAt = createDate(sessionExpiresIn);
					const { session } = yield* HttpClientRequest.post(
						`${serverURL}/api/auth/create-session`,
					).pipe(
						HttpClientRequest.jsonBody({
							authID,
							expiresAt: sessionExpiresAt.toISOString(),
						}),
						Effect.andThen(HttpClient.fetchOk),
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(
								Schema.Struct({ session: SessionSchema }),
							),
						),
						Effect.scoped,
					);

					return { ...session, fresh: true };
				}).pipe(
					//TODO: Handle errors
					Effect.orDie,
				),
			);
		},
		invalidateSession: (sessionId: string) => {
			return Effect.runPromise(
				Effect.gen(function* () {
					yield* HttpClientRequest.del(
						`${serverURL}/api/auth/session/${sessionId}`,
					).pipe(HttpClient.fetchOk, Effect.scoped);
				}).pipe(
					//TODO: Handle errors
					Effect.orDie,
				),
			);
		},
		deleteExpiredSessions: () => {
			return Effect.runPromise(
				Effect.gen(function* () {
					yield* HttpClientRequest.del(
						`${serverURL}/api/auth/expired-sessions`,
					).pipe(HttpClient.fetchOk, Effect.scoped);
				}).pipe(
					//TODO: Handle errors
					Effect.orDie,
				),
			);
		},
		readBearerToken: (authorizationHeader: string) => {
			const [authScheme, token] = authorizationHeader.split(" ") as [
				string,
				string | undefined,
			];
			if (authScheme !== "Bearer") {
				return null;
			}
			return token ?? null;
		},
	};
};
