import type { Bindings, Env } from "@blazell/validators";
import { Context } from "effect";

class Cloudflare extends Context.Tag("Cloudflare")<
	Cloudflare,
	{
		readonly env: Env & Bindings;
		readonly headers: Headers;
		readonly request: Request;
	}
>() {}

export { Cloudflare };
