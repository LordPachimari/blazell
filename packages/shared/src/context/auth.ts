import type { AuthUser } from "@blazell/validators";
import { Context } from "effect";

class AuthContext extends Context.Tag("Auth")<
	AuthContext,
	{
		readonly authUser: AuthUser | null;
	}
>() {}

export { AuthContext };
