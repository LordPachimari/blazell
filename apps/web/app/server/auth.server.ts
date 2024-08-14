import { SESSION_KEY, type Authentication } from "@blazell/auth/src";
import type { AuthSession } from "@blazell/validators";
import type { Session, SessionData } from "@remix-run/cloudflare";

export async function getUserAndSession(
	auth: ReturnType<typeof Authentication>,
	session: Session<SessionData, SessionData>,
	sessionKey?: string,
) {
	const sessionId = session.get(sessionKey ?? SESSION_KEY);
	if (!sessionId) return { user: null, session: null };
	const { session: userSession, user } = await auth.validateSession(sessionId);
	let currentSession: AuthSession | undefined;
	if (userSession && !userSession.fresh && user) {
		await auth.invalidateSession(session.id);
		const newSession = await auth.createSession(user.id);
		session.set(auth.sessionKey, newSession);
		currentSession = newSession;
	}
	if (userSession) currentSession = userSession;
	return { user, session: currentSession };
}
