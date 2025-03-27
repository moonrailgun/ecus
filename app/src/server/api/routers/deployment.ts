import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  accessLog,
  activeDeploymentHistory,
  activeDeployments,
  channel,
} from "@/server/db/schema";
import { and, between, eq, sql } from "drizzle-orm";
import { promoteDeployment, updateDeploymentMetadata } from "../deployment";

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

      const activeDeploments = await promoteDeployment(
        projectId,
        runtimeVersion,
        deploymentId,
        channelId,
        userId,
      );

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
        );

      return activeDeploments;
    }),
  statsAccess: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        timezone: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { projectId, startDate, endDate, timezone } = input;

      const result = await db
        .select({
          date: sql<Date>`date_trunc('day', deduplicated.created_at AT TIME ZONE ${timezone})`.as(
            "date",
          ),
          version: sql<string>`
        CASE
          WHEN deduplicated.current_update_id = deduplicated.embedded_update_id THEN 'embed'
          ELSE COALESCE(active_deployment_history.deployment_id::TEXT, 'unknown')
        END
      `.as("version"),
          count: sql<number>`CAST(COUNT(1) AS INTEGER)`.as("count"),
          runtimeVersion: sql<string>`deduplicated.runtime_version`.as(
            "runtime_version",
          ),
        })
        .from(
          sql`
        (
          SELECT DISTINCT ON (client_id)
            client_id,
            project_id,
            current_update_id,
            embedded_update_id,
            runtime_version,
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
        .where(
          between(
            sql`deduplicated.created_at`,
            startDate.toISOString(),
            endDate.toISOString(),
          ),
        )
        .groupBy(
          sql`date, deduplicated.project_id, version, deduplicated.runtime_version`,
        )
        .orderBy(sql`date DESC, deduplicated.project_id, version`);

      return result;
    }),
  updateMetadata: protectedProcedure
    .input(
      z.object({
        deploymentId: z.string(),
        metadata: z.record(z.string(), z.any()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { deploymentId, metadata } = input;
      const userId = ctx.session.user.id;

      const updatedDeployment = await updateDeploymentMetadata(
        deploymentId,
        metadata,
        userId,
      );

      return {
        updatedDeployment,
      };
    }),
});
