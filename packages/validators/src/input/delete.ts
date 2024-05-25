import { z } from "zod";

export const DeleteInputSchema = z.object({
	id: z.string(),
});
export type DeleteInput = z.infer<typeof DeleteInputSchema>;
