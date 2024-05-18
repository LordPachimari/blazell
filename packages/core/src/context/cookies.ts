import { Context } from "effect";

class Cookies extends Context.Tag("Cookies")<
	Cookies,
	{
		readonly cartID: string | undefined;
	}
>() {}

export { Cookies };
