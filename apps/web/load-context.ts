import type { PlatformProxy } from "wrangler";
import { z } from "zod";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
// biome-ignore lint/suspicious/noEmptyInterface: <explanation>

type Cloudflare = Omit<PlatformProxy<AppEnv>, "dispose">;
export const AppEnvSchema = z.object({
	REPLICACHE_KEY: z.string(),
	WORKER_URL: z.string(),
	SESSION_SECRET: z.string(),
	PARTYKIT_HOST: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
});
export type AppEnv = z.infer<typeof AppEnvSchema>;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: Cloudflare;
	}
}
