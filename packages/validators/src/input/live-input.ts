import { Schema } from "@effect/schema";

class LiveInputResponse extends Schema.Class<LiveInputResponse>("Todo")({
	result: Schema.Union(
		Schema.Struct({
			uid: Schema.String,
			webRTC: Schema.Struct({
				url: Schema.String,
			}),
			webRTCPlayback: Schema.Struct({
				url: Schema.String,
			}),
		}),
		Schema.Null,
		Schema.Undefined,
	),
	success: Schema.Boolean,
	errors: Schema.Array(
		Schema.Struct({
			message: Schema.String,
			code: Schema.Number,
		}),
	),
}) {
	static encodeSync = Schema.encodeSync(this);
	static encodeUnkown = Schema.encodeUnknown(this);
}

export { LiveInputResponse };
