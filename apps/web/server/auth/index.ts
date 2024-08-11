import type { AuthSession, AuthUser } from "@blazell/validators";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { getHonoClient } from "..";
import { SESSION_KEY } from "~/server/auth.server";
import type { Context, Next } from "hono";
import { getSession } from "remix-hono/session";

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
		this.sessionCookieName = options?.sessionCookieName ?? SESSION_KEY;
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

	public async createSession(authID: string): Promise<AuthSession> {
		const sessionExpiresAt = createDate(this.sessionExpiresIn);
		const result = await this.client.api.auth["create-session"].$post({
			json: {
				authID,
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

	public async invalidateUserSessions(authID: string): Promise<void> {
		await this.client.api.auth["user-session"][":authID"].$delete({
			param: {
				authID,
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

export const authMiddleware = async (c: Context, next: Next) => {
	const url = new URL(c.req.url);
	const origin = url.origin;
	const auth = new Authentication({
		serverURL: origin,
	});
	const honoSession = getSession(c);

	const sessionID =
		(honoSession.get(auth.sessionCookieName) as string) ??
		auth.readBearerToken(c.req.raw.headers.get("Authorization") ?? "");
	if (!sessionID) {
		c.set("auth" as never, {
			user: null,
			session: null,
		});
		return next();
	}

	let currentSession: AuthSession | undefined;
	const { session, user } = await auth.validateSession(sessionID);
	console.log("session and user from validation", session, user);
	if (session && !session.fresh && user) {
		await auth.invalidateSession(session.id);
		const newSession = await auth.createSession(user.id);
		honoSession.set(auth.sessionCookieName, newSession.id);
		currentSession = newSession;
	}
	if (session) currentSession = session;

	c.set("auth" as never, {
		user,
		session: currentSession,
	});

	await next();
};
