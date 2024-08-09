import type { AuthUser, Env } from "@blazell/validators";
import type {
	Session,
	SessionData,
	SessionStorage,
} from "@remix-run/cloudflare";
import type { PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: Cloudflare;
		sessionStorage: SessionStorage<SessionData, SessionData>;
		session: Session<SessionData, SessionData>;
		user: AuthUser | undefined;
	}
}
