import type { PlatformProxy } from "wrangler";
import { z } from "zod";

type Cloudflare = Omit<PlatformProxy<AppEnv>, "dispose">;
export const AppEnvSchema = z.object({
	REPLICACHE_KEY: z.string(),
	WORKER_URL: z.string(),
	PARTYKIT_HOST: z.string(),
});
export type AppEnv = z.infer<typeof AppEnvSchema>;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		cloudflare: Cloudflare;
	}
}
