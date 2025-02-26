import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  activeDeploymentHistory,
  activeDeployments,
  channel,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { createAuditLog } from "@/server/db/helper";

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
    .mutation(async ({ input, ctx }) => {
      const { projectId, runtimeVersion, deploymentId, channelId } = input;
      const userId = ctx.session.user.id;

      const res = await db.transaction(async (tx) => {
        const existed = await tx.query.activeDeployments.findFirst({
          where: and(
            eq(activeDeployments.projectId, projectId),
            eq(activeDeployments.runtimeVersion, runtimeVersion),
            eq(activeDeployments.channelId, channelId),
          ),
        });

        if (existed?.updateId) {
          await tx.insert(activeDeploymentHistory).values({
            projectId,
            runtimeVersion,
            deploymentId,
            channelId,
            updateId: existed.updateId,
          });
        }

        const res = await tx
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

        return res;
      });

      await createAuditLog(projectId, userId, "promote deployment", {
        projectId,
        runtimeVersion,
        deploymentId,
        channelId,
      });

      return {
        activeDeploments: res,
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
