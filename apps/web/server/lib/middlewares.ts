import type { Context, Next } from "hono";
import { Authentication } from "@blazell/auth/src";
import { getSession } from "remix-hono/session";
import type { AuthSession } from "@blazell/validators";

export const authMiddleware = async (c: Context, next: Next) => {
	const url = new URL(c.req.url);
	const origin = url.origin;
	const auth = Authentication({
		serverURL: origin,
	});
	const honoSession = getSession(c);

	const sessionID =
		(honoSession.get(auth.sessionKey) as string) ??
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
		honoSession.set(auth.sessionKey, newSession.id);
		currentSession = newSession;
	}
	if (session) currentSession = session;

	c.set("auth" as never, {
		user,
		session: currentSession,
	});

	await next();
};
