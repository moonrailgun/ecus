import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  accessLog,
  activeDeploymentHistory,
  activeDeployments,
  channel,
} from "@/server/db/schema";
import { and, eq, sql } from "drizzle-orm";
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

      void createAuditLog(projectId, userId, "promote deployment", {
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
  statsAccess: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId } = input;

      const result = await db
        .select({
          date: sql<Date>`date_trunc('day', deduplicated.created_at)`.as(
            "date",
          ),
          version: sql<string>`
        CASE
          WHEN deduplicated.current_update_id = deduplicated.embedded_update_id THEN 'embed'
          ELSE COALESCE(active_deployment_history.deployment_id::TEXT, 'unknown')
        END
      `.as("version"),
          count: sql<number>`COUNT(*)`.as("count"),
        })
        .from(
          sql`
        (
          SELECT DISTINCT ON (client_id)
            client_id,
            project_id,
            current_update_id,
            embedded_update_id,
            created_at
          FROM ${accessLog}
          WHERE client_id IS NOT NULL AND project_id = ${projectId}
          ORDER BY client_id, created_at DESC
        ) AS deduplicated
      `,
        )
        .leftJoin(
          activeDeploymentHistory,
          sql`deduplicated.current_update_id::UUID = ${activeDeploymentHistory.updateId}`,
        )
        .groupBy(
          sql`date_trunc('day', deduplicated.created_at), deduplicated.project_id, version`,
        )
        .orderBy(sql`date DESC, deduplicated.project_id, version`);

      return result;
    }),
});
