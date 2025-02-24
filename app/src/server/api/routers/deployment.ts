import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { activeDeployments, channel } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const deploymentRouter = createTRPCRouter({
  promote: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        runtimeVersion: z.string(),
        deploymentId: z.string(),
        channelId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { projectId, runtimeVersion, deploymentId, channelId } = input;

      const activeDeploments = await db
        .insert(activeDeployments)
        .values({ projectId, runtimeVersion, deploymentId, channelId })
        .onConflictDoUpdate({
          target: [
            activeDeployments.projectId,
            activeDeployments.runtimeVersion,
            activeDeployments.channelId,
          ],
          set: { deploymentId },
        })
        .returning();

      return {
        activeDeploments,
      };
    }),
  activeDeployment: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        runtimeVersion: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId, runtimeVersion } = input;

      const activeDeploments = await db
        .select()
        .from(activeDeployments)
        .leftJoin(channel, eq(channel.id, activeDeployments.channelId))
        .where(
          and(
            eq(activeDeployments.projectId, projectId),
            eq(activeDeployments.runtimeVersion, runtimeVersion),
          ),
        )
        .limit(1);

      return activeDeploments;
    }),
});
