import type { Effect } from "effect";

import type { NeonDatabaseError, RowsWTableName } from "@blazell/validators";
import type { Cloudflare, Database } from "@blazell/shared";
import type { ReplicacheContext } from "../../context";

export type GetRowsWTableName = ({
	fullRows,
}: {
	fullRows: boolean;
}) => Effect.Effect<
	RowsWTableName[],
	NeonDatabaseError,
	Cloudflare | ReplicacheContext | Database
>;
