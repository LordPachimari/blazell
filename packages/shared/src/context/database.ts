import { Context } from "effect";

import type { Db, TableNameToTableMap, Transaction } from "@blazell/db";

class Database extends Context.Tag("Database")<
	Database,
	{
		readonly manager: Transaction | Db;
		readonly tableNameToTableMap?: TableNameToTableMap;
	}
>() {}

export { Database };
