import { z } from "zod";

const BindingsSchema = z.object({
	DATABASE_URL: z.string(),
	REPLICACHE_KEY: z.string(),
	RESEND_API_KEY: z.string(),
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
	AWS_EMAIL_ACCESS_KEY: z.string(),
	AWS_EMAIL_SECRET_KEY: z.string(),
});

type Env = z.infer<typeof BindingsSchema>;
type Bindings = { KV: KVNamespace };
export { BindingsSchema };
export type { Env, Bindings };
