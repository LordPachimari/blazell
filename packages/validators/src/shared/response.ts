import { z } from "zod";
import { FileFieldSchema, InputFieldSchema } from "./errors";

export const UpdateStoreResponse = z.object({
	name: InputFieldSchema,
	description: InputFieldSchema,
	headerImage: FileFieldSchema,
	storeImage: FileFieldSchema,
});
