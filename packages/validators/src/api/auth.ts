import { Schema } from "@effect/schema";
const SessionSchema = Schema.Struct({
	id: Schema.String,
	authID: Schema.String,
	expiresAt: Schema.String,
	createdAt: Schema.String,
});
const VerifyOTPSchema = Schema.Struct({
	status: Schema.Literal("success", "error"),
	valid: Schema.Boolean,
	onboard: Schema.Boolean,
	session: Schema.NullOr(
		Schema.Struct({
			id: Schema.String,
			authID: Schema.String,
			createdAt: Schema.String,
			expiresAt: Schema.String,
			fresh: Schema.Boolean,
		}),
	),
});

const PrepareVerificationSchema = Schema.Struct({
	status: Schema.Literal("success", "error"),
});

const GoogleSchema = Schema.Struct({
	status: Schema.Literal("success", "error"),
	url: Schema.String,
	codeVerifier: Schema.String,
	state: Schema.String,
});

const GoogleCallbackSchema = Schema.Struct({
	status: Schema.Literal("success", "error"),
	session: Schema.extend(
		SessionSchema,
		Schema.Struct({ fresh: Schema.Boolean }),
	),
	onboard: Schema.Boolean,
});
export {
	VerifyOTPSchema,
	PrepareVerificationSchema,
	GoogleCallbackSchema,
	GoogleSchema,
};
