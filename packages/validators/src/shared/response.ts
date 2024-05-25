import { z } from "zod";
import { ErrorTypeSchema, FileFieldSchema, InputFieldSchema } from "./errors";
import { Schema } from "@effect/schema";

export class ApiResponse extends Schema.Class<ApiResponse>("Todo")({
	type: Schema.Union(ErrorTypeSchema, Schema.Literal("Success")),
	message: Schema.String,
	body: Schema.optional(Schema.Record(Schema.String, Schema.Any)),
}) {}
export const UpdateStoreResponse = z.object({
	name: InputFieldSchema,
	description: InputFieldSchema,
	headerImage: FileFieldSchema,
	storeImage: FileFieldSchema,
});
