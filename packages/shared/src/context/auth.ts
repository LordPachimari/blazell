import type { Auth } from "@blazell/validators";
import { Context } from "effect";

class AuthContext extends Context.Tag("Auth")<
	AuthContext,
	{
		readonly auth: Auth;
	}
>() {}

export { AuthContext };
