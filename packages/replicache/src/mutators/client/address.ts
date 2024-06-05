import type { UpdateAddress } from "@blazell/validators";
import type { WriteTransaction } from "replicache";
import type { Address } from "@blazell/validators/client";

async function updateAddress(tx: WriteTransaction, input: UpdateAddress) {
	const { id, updates } = input;
	const address = await tx.get<Address>(id);

	if (!address) {
		console.info("Address  not found");
		throw new Error("Address not found");
	}

	await tx.set(id, {
		...address,
		...updates,
	});
}
export { updateAddress };
