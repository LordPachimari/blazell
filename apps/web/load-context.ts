import type { PlatformProxy } from "wrangler";
import { z } from "zod";

// You can generate the ENV type based on `wrangler.toml` and `.dev.vars`
// by running `npm run typegen`

const AppEnvSchema = z.object({
	REPLICACHE_KEY: z.string(),
	WORKER_URL: z.string(),
	SESSION_SECRET: z.string(),
	PARTYKIT_HOST: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	TRANSFORMER_URL: z.string(),
});

export type Env = z.infer<typeof AppEnvSchema>;
type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;
type LoadContext = {
	cloudflare: Cloudflare;
};

//@ts-ignore
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
