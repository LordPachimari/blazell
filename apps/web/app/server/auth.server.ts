import type { AuthSession } from "@blazell/validators";
import type { Session, SessionData } from "@remix-run/cloudflare";
import type { Authentication } from "server";
export const SESSION_KEY = "blazell-session";

export async function getUserAndSession(
	auth: Authentication,
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
		session.set(auth.sessionCookieName, newSession);
		currentSession = newSession;
	}
	if (userSession) currentSession = userSession;
	return { user, session: currentSession };
}
