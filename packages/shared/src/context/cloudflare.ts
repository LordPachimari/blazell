import type { Bindings, Env } from "@blazell/validators";
import { Context } from "effect";

class Cloudflare extends Context.Tag("Cloudflare")<
	Cloudflare,
	{
		readonly env: Env;
		readonly bindings: Bindings;
		readonly request: Request;
	}
>() {}

export { Cloudflare };
