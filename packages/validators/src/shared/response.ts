import { z } from "zod";

export const ServerResponse = z.object({
	type: z.enum(["SUCCESS", "ERROR"] as const),
	message: z.string(),
});
