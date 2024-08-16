import type { AuthUser } from "@blazell/validators";
import type { Context } from "hono";
import { getSession } from "remix-hono/session";
import { Authentication } from "server/auth";

export const getAuthUser = async (c: Context): Promise<AuthUser | null> => {
	const auth = Authentication({
		env: c.env,
		request: c.req.raw,
		bindings: {
			KV: c.env.KV,
		},
	});
	const honoSession = getSession(c);
	const sessionID =
		(honoSession.get(auth.sessionKey) as string) ??
		auth.readBearerToken(c.req.raw.headers.get("Authorization") ?? "");
	if (!sessionID) {
		return null;
	}

	const { session, user } = await auth.validateSession(sessionID);
	if (!session) {
		return null;
	}
	if (session && !session.fresh && user) {
		await auth.invalidateSession(session.id);
		const newSession = await auth.createSession(user.id);
		honoSession.set(auth.sessionKey, newSession.id);
	}
	return user ?? null;
};
