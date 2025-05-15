import "@/utils/date";
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
import { promoteDeployment, updateDeploymentMetadata } from "../deployment";
import dayjs from "dayjs";

// 定义日志记录类型
interface AccessLogRecord {
  client_id: string;
  project_id: string;
  current_update_id: string | null;
  embedded_update_id: string | null;
  runtime_version: string;
  created_at: string;
  [key: string]: unknown; // 添加索引签名
}

// 定义结果数据类型
interface StatsResult {
  date: Date;
  version: string;
  count: number;
  runtimeVersion: string;
}

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

      // Step 1: Get the deduplicated client records within the specified date range
      const deduplicatedLogs = await db.execute<AccessLogRecord>(sql`
        SELECT DISTINCT ON (client_id)
          client_id,
          project_id,
          current_update_id,
          embedded_update_id,
          runtime_version,
          created_at
        FROM ${accessLog}
        WHERE
          client_id IS NOT NULL
          AND project_id = ${projectId}
          AND created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
        ORDER BY client_id, created_at DESC
      `);

      if (deduplicatedLogs.length === 0) {
        return [];
      }

      // Step 2: Get the related deployment history records
      const updateIds = deduplicatedLogs
        .map((log: AccessLogRecord) => log.current_update_id)
        .filter((id): id is string => id !== null); // 类型守卫确保非null

      const deploymentMapping: Record<string, string> = {};

      if (updateIds.length > 0) {
        // Get the deployment IDs in bulk, rather than doing a join in the main query
        const deploymentHistory = await db
          .select()
          .from(activeDeploymentHistory)
          .where(
            sql`${activeDeploymentHistory.updateId} IN (${sql.join(
              updateIds.map((id) => sql`${id}::UUID`),
              sql`, `,
            )})`,
          );

        // Create a mapping from updateId to deploymentId
        for (const record of deploymentHistory) {
          if (record.updateId && record.deploymentId) {
            deploymentMapping[record.updateId] = record.deploymentId;
          }
        }
      }

      // Step 3: Group and count in memory
      type VersionData = { count: number; runtimeVersion: string };
      type DateGroup = Record<string, VersionData>;
      const groupedData: Record<string, DateGroup> = {};

      for (const log of deduplicatedLogs) {
        const dateKey = dayjs(log.created_at).tz(timezone).format("YYYY-MM-DD");

        // Determine the version
        let version = "unknown";
        if (
          log.current_update_id &&
          log.embedded_update_id &&
          log.current_update_id === log.embedded_update_id
        ) {
          version = "embed";
        } else if (
          log.current_update_id &&
          deploymentMapping[log.current_update_id]
        ) {
          version = String(deploymentMapping[log.current_update_id]);
        }

        // Initialize the grouping structure
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {};
        }

        if (!groupedData[dateKey][version]) {
          groupedData[dateKey][version] = {
            count: 0,
            runtimeVersion: log.runtime_version,
          };
        }
        // Increment the count
        if (groupedData[dateKey][version]) {
          groupedData[dateKey][version]!.count += 1;
        }
      }

      // Step 4: Convert to the expected output format
      const result: StatsResult[] = [];

      for (const [dateStr, versions] of Object.entries(groupedData)) {
        for (const [versionKey, data] of Object.entries(versions)) {
          result.push({
            date: new Date(dateStr),
            version: versionKey,
            count: data.count,
            runtimeVersion: data.runtimeVersion,
          });
        }
      }

      // Sort the results
      result.sort((a, b) => {
        // First sort by date in descending order
        const dateCompare = b.date.getTime() - a.date.getTime();
        if (dateCompare !== 0) return dateCompare;

        // If dates are the same, sort by version
        return a.version.localeCompare(b.version);
      });

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
