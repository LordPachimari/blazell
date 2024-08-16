import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;
const createCallerFactory = t.createCallerFactory;

export const appRouter = router({
	hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
		return `Hello ${input ?? "World"}!`;
	}),
});
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
