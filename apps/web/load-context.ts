import type { AuthUser, Bindings, Env } from "@blazell/validators";
import type { Session, SessionData } from "@remix-run/cloudflare";

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: { env: Env; bindings: Bindings };
		session: Session<SessionData, SessionData>;
		authUser: AuthUser | undefined;
	}
}
