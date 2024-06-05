import type { Bindings } from "@blazell/validators";
import { Context } from "effect";

class Cloudflare extends Context.Tag("Cloudflare")<
	Cloudflare,
	{
		readonly env: Bindings;
		readonly headers: Headers;
	}
>() {}

export { Cloudflare };
