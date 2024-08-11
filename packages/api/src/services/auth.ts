import { schema } from "@blazell/db";
import { Cloudflare, Database } from "@blazell/shared";
import { generateID, getDomainUrl } from "@blazell/utils";
import type { Verification } from "@blazell/validators/server";
import * as OTPAuth from "otpauth";
import { Console, Effect } from "effect";
import { eq } from "drizzle-orm";

const getRedirectToUrl = ({
	target,
	redirectTo,
}: {
	target: string;
	redirectTo?: string;
}) =>
	Effect.gen(function* () {
		const { request } = yield* Cloudflare;
		const url = new URL(request.url);
		const origin = url.origin;

		const redirectToUrl = new URL(`${origin}/verify`);
		redirectToUrl.searchParams.set("target", target);
		if (redirectTo) {
			redirectToUrl.searchParams.set("redirectTo", redirectTo);
		}
		return redirectToUrl;
	});
const prepareVerification = ({
	target,
	redirectTo,
	period: periodInput,
}: {
	target: string;
	period?: number;
	redirectTo?: string;
}) =>
	Effect.gen(function* () {
		const { manager } = yield* Database;
		const emailVerifyURL = yield* getRedirectToUrl({
			target,
			...(redirectTo && { redirectTo }),
		});
		const verifyURL = new URL(emailVerifyURL.toString());

		// A cryptographically secure random secret can also be generated with:
		const secret = new OTPAuth.Secret({ size: 20 }).base32;
		const totp = new OTPAuth.TOTP({
			// Provider or service the account is associated with.
			issuer: "Blazell",
			// Algorithm used for the HMAC function.
			algorithm: "SHA1",
			// Length of the generated tokens.
			digits: 6,
			// Interval of time for which a token is valid, in seconds.
			period: periodInput ?? 3600,
			// Arbitrary key encoded in Base32 or OTPAuth.Secret instance.
			secret,
		});
		const otp = totp.generate();

		yield* Effect.tryPromise(() =>
			manager
				.insert(schema.verifications)
				.values({
					id: generateID({ prefix: "verification" }),
					createdAt: new Date().toISOString(),
					target,
					secret,
					algorithm: totp.algorithm,
					digits: totp.digits,
					period: totp.period,
				} satisfies Verification)

				.onConflictDoUpdate({
					set: {
						createdAt: new Date().toISOString(),
						period: totp.period,
						secret,
						algorithm: totp.algorithm,
						digits: totp.digits,
					},
					target: schema.verifications.target,
				}),
		);

		// add the otp to the url we'll email the user.
		emailVerifyURL.searchParams.set("otp", otp);

		return { otp, emailVerifyURL, verifyURL };
	});
const verifyOTP = (props: { target: string; otp: string }) => {
	return Effect.gen(function* () {
		const { manager } = yield* Database;
		const { target, otp } = props;
		const verification = yield* Effect.tryPromise(() =>
			manager.query.verifications.findFirst({
				where: (verifications, { eq }) => eq(verifications.target, target),
			}),
		);
		if (!verification) {
			return false;
		}
		const totp = new OTPAuth.TOTP({
			secret: verification.secret,
			algorithm: verification.algorithm,
			digits: verification.digits,
			period: verification.period,
		});
		const delta = totp.validate({ token: otp, window: 1 });
		yield* Console.log("delta", delta);
		if (delta === null) {
			return false;
		}
		yield* Effect.tryPromise(() =>
			manager
				.delete(schema.verifications)
				.where(eq(schema.verifications.target, target)),
		);
		return true;
	});
};
export { prepareVerification, getDomainUrl, verifyOTP };
