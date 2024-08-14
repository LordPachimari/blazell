import { z } from "zod";

const BindingsSchema = z.object({
	SERVER_URL: z.string(),
	DATABASE_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	ENVIRONMENT: z.enum([
		"production",
		"test",
		"staging",
		"development",
		"local",
	]),
	PARTYKIT_ORIGIN: z.string(),
	PARTYKIT_HOST: z.string(),
	HONEYPOT_SECRET: z.string(),
	SESSION_SECRET: z.string().optional(),
	IMAGE_API_TOKEN: z.string(),
	ACCOUNT_ID: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
});

type Env = z.infer<typeof BindingsSchema>;
type Bindings = { KV: KVNamespace };
export { BindingsSchema };
export type { Env, Bindings };
