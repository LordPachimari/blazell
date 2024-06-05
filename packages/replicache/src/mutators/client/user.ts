import type { WriteTransaction } from "replicache";

import type { UpdateUser } from "@blazell/validators";
import type { User } from "@blazell/validators/client";

async function updateUser(tx: WriteTransaction, input: UpdateUser) {
	const { id, updates } = input;
	const user = await tx.get<User>(id);
	if (!user) {
		console.info("User  not found");
		throw new Error("User not found");
	}
	await tx.set(id, { ...user, ...updates });
}

export { updateUser };
