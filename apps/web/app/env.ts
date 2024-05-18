/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

export const env = createEnv({
	extends: [vercel()],
	shared: {
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	/**
	 * Specify your server-side environment variables schema here.
	 * This way you can ensure the app isn't built with invalid env vars.
	 */
	server: {
		REPLICACHE_KEY: z.string(),
		WORKER_URL: z.string(),
		SESSION_SECRET: z.string(),
		PARTYKIT_HOST: z.string(),
	},

	/**
	 * Specify your client-side environment variables schema here.
	 * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
	 */
	client: {},
	/**
	 * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
	 */
	experimental__runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		//@ts-ignore
		REPLICACHE_KEY: process.env.REPLICACHE_KEY,
		WORKER_URL: process.env.WORKER_URL,
		SESSION_SECRET: process.env.SESSION_SECRET,
		PARTYKIT_HOST: process.env.PARTYKIT_HOST,

		// NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
	},
	skipValidation:
		!!process.env.CI ||
		!!process.env.SKIP_ENV_VALIDATION ||
		process.env.npm_lifecycle_event === "lint",
});
