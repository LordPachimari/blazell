export type Bindings = {
	DATABASE_URL: string;
	ENVIRONMENT: "production" | "test" | "staging" | "development" | "local";
	CLERK_SERCRET_KEY: string;
	CLERK_PUBLISHABLE_KEY: string;
	KV: KVNamespace;
	PARTYKIT_ORIGIN: string;
	IMAGE_API_TOKEN: string;
	ACCOUNT_ID: string;
};
