import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { activeDeployments } from "@/server/db/schema";

export const deploymentRouter = createTRPCRouter({
  promote: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        runtimeVersion: z.string(),
        deploymentId: z.string(),
        branchId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { projectId, runtimeVersion, deploymentId, branchId } = input;

      const activeDeploments = await db
        .insert(activeDeployments)
        .values({ projectId, runtimeVersion, deploymentId, branchId })
        .onConflictDoUpdate({
          target: [
            activeDeployments.projectId,
            activeDeployments.runtimeVersion,
            activeDeployments.branchId,
          ],
          set: { deploymentId },
        })
        .returning();

      return {
        activeDeploments,
      };
    }),
});
