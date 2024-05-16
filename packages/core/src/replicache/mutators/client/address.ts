import type { UpdateAddress } from "@pachi/validators";
import type { WriteTransaction } from "replicache";
import { getEntityFromID } from "./util/get-id";
import type { Address } from "@pachi/validators/client";

async function updateAddress(tx: WriteTransaction, input: UpdateAddress) {
	const { id, updates } = input;
	const address = (await getEntityFromID(tx, id)) as Address | undefined;

	if (!address) {
		console.info("Address  not found");
		throw new Error("Address not found");
	}

	await tx.set(address.replicachePK, {
		...address,
		...updates,
	});
}
export { updateAddress };
