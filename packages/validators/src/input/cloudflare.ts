export type Bindings = {
	ORIGIN_URL: string;
	DATABASE_URL: string;
	ENVIRONMENT: "production" | "test" | "staging" | "development" | "local";
	R2: R2Bucket;
	CLERK_SERCRET_KEY: string;
	CLERK_PUBLISHABLE_KEY: string;
	KV: KVNamespace;
	PARTYKIT_ORIGIN: string;
	IMAGE_API_TOKEN: string;
	ACCOUNT_ID: string;
	IMAGE_DELIVERY_ORIGIN: string;
};
