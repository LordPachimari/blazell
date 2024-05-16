import { Context } from "effect";

class Cloudflare extends Context.Tag("Cloudflare")<
	Cloudflare,
	{
		readonly KV: KVNamespace;
		readonly R2: R2Bucket;
		readonly countryCode: string | null;
	}
>() {}

export { Cloudflare };
