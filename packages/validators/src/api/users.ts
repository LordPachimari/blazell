import { Schema } from "@effect/schema";

const UsernameSchema = Schema.Struct({
	username: Schema.NullishOr(Schema.String),
});
const OnboardSchema = Schema.Struct({
	status: Schema.Literal("success", "error"),
});
export { UsernameSchema, OnboardSchema };
