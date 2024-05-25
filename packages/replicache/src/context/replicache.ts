import type { SpaceID, SpaceRecord } from "@blazell/validators";
import { Context } from "effect";

class ReplicacheContext extends Context.Tag("TableMutator")<
	ReplicacheContext,
	{
		spaceID: SpaceID;
		subspaceIDs: SpaceRecord[SpaceID] | undefined;
		clientGroupID: string;
		authID: string | null | undefined;
	}
>() {}
export { ReplicacheContext };
