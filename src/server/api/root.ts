import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
import { projectRouter } from "./routers/project";
import { organizationRouter } from "./routers/organization";
import { toolRouter } from "./routers/tool";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  organization: organizationRouter,
  tool: toolRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
