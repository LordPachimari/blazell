import type { WriteTransaction } from "replicache";

import type { UpdateUser, UserInsert } from "@pachi/validators";
import { getEntityFromID } from "./util/get-id";
import type { User } from "@pachi/validators/client";

async function createUser(tx: WriteTransaction, input: { user: UserInsert }) {
	const { user } = input;
	await tx.set(user.id, user);
}

async function updateUser(tx: WriteTransaction, input: UpdateUser) {
	const { id, username } = input;
	const user = (await getEntityFromID(tx, id)) as User | undefined;
	if (!user) {
		console.info("User  not found");
		throw new Error("User not found");
	}
	await tx.set(id, { ...user, ...(username && { username }) });
}

export { updateUser, createUser };
