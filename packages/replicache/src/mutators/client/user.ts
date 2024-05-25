import type { WriteTransaction } from "replicache";

import type { CreateUser, InsertStore, UpdateUser } from "@blazell/validators";
import type { User } from "@blazell/validators/client";
import { getEntityFromID } from "./util/get-id";
import { generateReplicachePK } from "@blazell/utils";

async function updateUser(tx: WriteTransaction, input: UpdateUser) {
	const { id, updates } = input;
	const user = (await getEntityFromID(tx, id)) as User | undefined;
	if (!user) {
		console.info("User  not found");
		throw new Error("User not found");
	}
	await tx.set(id, { ...user, ...updates });
}

export { updateUser };
