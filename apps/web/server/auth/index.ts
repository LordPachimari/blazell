import type { AuthSession, AuthUser } from "@blazell/validators";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { getHonoClient } from "..";

export class Authentication<
	_SessionAttributes extends {} = Record<never, never>,
	_UserAttributes extends {} = Record<never, never>,
> {
	private sessionExpiresIn: TimeSpan;

	public readonly sessionCookieName: string;
	public readonly client: ReturnType<typeof getHonoClient>;

	constructor(options?: {
		sessionCookieName?: string;
		sessionExpiresIn?: TimeSpan;
		serverURL: string;
	}) {
		this.sessionExpiresIn = options?.sessionExpiresIn ?? new TimeSpan(30, "d");
		this.client = getHonoClient(options?.serverURL ?? "http://localhost:5173");
		this.sessionCookieName = options?.sessionCookieName ?? "blazell-session";
	}

	public async validateSession(
		sessionId: string,
	): Promise<
		{ user: AuthUser; session: AuthSession } | { user: null; session: null }
	> {
		const result = await this.client.api.auth["user-session"].$get({
			query: { sessionID: sessionId },
		});

		if (result.ok) {
			const { session, user } = await result.json();
			if (!session) return { user: null, session: null };
			if (!user) {
				await this.client.api.auth.session[":id"].$delete({
					param: {
						id: sessionId,
					},
				});
				return { user: null, session: null };
			}
			if (!isWithinExpirationDate(new Date(session.expiresAt))) {
				await this.client.api.auth.session[":id"].$delete({
					param: {
						id: sessionId,
					},
				});
				return { user: null, session: null };
			}
			const activePeriodExpirationDate = new Date(
				new Date(session.expiresAt).getTime() -
					this.sessionExpiresIn.milliseconds() / 2,
			);
			const currentSession: AuthSession = {
				...session,
				fresh: true,
			};
			if (!isWithinExpirationDate(activePeriodExpirationDate)) {
				currentSession.fresh = false;
			}
			return { user, session: currentSession };
		}
		return { user: null, session: null };
	}

	public async createSession(userID: string): Promise<AuthSession> {
		const sessionExpiresAt = createDate(this.sessionExpiresIn);
		const result = await this.client.api.auth["create-session"].$post({
			json: {
				userID,
				expiresAt: sessionExpiresAt.toISOString(),
			},
		});
		if (result.ok) {
			const { session } = await result.json();
			return { ...session, fresh: true };
		}
		throw new Error("Failed to create session");
	}

	public async invalidateSession(sessionId: string): Promise<void> {
		await this.client.api.auth.session[":id"].$delete({
			param: {
				id: sessionId,
			},
		});
	}

	public async invalidateUserSessions(userID: string): Promise<void> {
		await this.client.api.auth["user-session"][":userID"].$delete({
			param: {
				userID,
			},
		});
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.client.api.auth["expired-sessions"].$delete();
	}

	public readBearerToken(authorizationHeader: string): string | null {
		const [authScheme, token] = authorizationHeader.split(" ") as [
			string,
			string | undefined,
		];
		if (authScheme !== "Bearer") {
			return null;
		}
		return token ?? null;
	}
}
