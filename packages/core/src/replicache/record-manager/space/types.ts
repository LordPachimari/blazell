import type { Effect } from "effect";

import type { Transaction } from "@pachi/db";
import type { RowsWTableName } from "@pachi/validators";
import type { Cookies } from "../../../context/cookies";

export type GetRowsWTableName = ({
	transaction,
	fullRows,
	authID,
}: {
	transaction: Transaction;
	fullRows: boolean;
	authID: string | null | undefined;
}) => Effect.Effect<RowsWTableName[], never, Cookies>;
