import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { deploymentRouter } from "./routers/deployment";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";
import { initCronJobs } from "../db/cron";

// Initialize cron jobs
initCronJobs();

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  project: projectRouter,
  deployment: deploymentRouter,
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
