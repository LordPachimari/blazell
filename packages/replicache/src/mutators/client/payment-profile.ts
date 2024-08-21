import { generateID } from "@blazell/utils";
import type { InsertPaymentProfile } from "@blazell/validators";
import type { StripeAccount } from "@blazell/validators/client";
import type { WriteTransaction } from "replicache";
async function createPaymentProfile(
	tx: WriteTransaction,
	input: {
		paymentProfile: InsertPaymentProfile;
		provider: "stripe";
	},
) {
	const { paymentProfile } = input;
	const stripe: StripeAccount = {
		id: generateID({}),
		createdAt: new Date().toISOString(),
		isLoading: true,
		paymentProfileID: paymentProfile.id,
		version: 0,
		updatedAt: null,
		isOnboarded: false,
	};

	await tx.set(paymentProfile.id, {
		...paymentProfile,
		stripe,
	});
}
export { createPaymentProfile };
