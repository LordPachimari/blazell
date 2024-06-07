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
const AppEnvSchema = z.object({
	REPLICACHE_KEY: z.string(),
	WORKER_URL: z.string(),
	SESSION_SECRET: z.string(),
	PARTYKIT_HOST: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
});
export type AppEnv = z.infer<typeof AppEnvSchema>;

type LoadContext = {
	cloudflare: Cloudflare;
};
declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		env: Cloudflare["env"];
		cf: Cloudflare["cf"];
		ctx: Cloudflare["ctx"];
		cache: Cloudflare["caches"];
	}
}

export function getLoadContext({
	context,
}: {
	request: Request;
	context: LoadContext;
}) {
	const env = AppEnvSchema.parse(context.cloudflare.env);
	return {
		env: env,
		cf: context.cloudflare.cf,
		ctx: context.cloudflare.ctx,
		cache: context.cloudflare.caches,
	};
}
