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
import pMap from "p-map";

// 定义结果数据类型
interface StatsResult {
  date: Date;
  version: string;
  count: number;
  runtimeVersion: string;
}

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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

      console.time("[STATS_ACCESS] total");

      console.time("[STATS_ACCESS] step1-fetch-update-ids");
      const updateIdRows = await db.execute<{ current_update_id: string }>(sql`
        SELECT DISTINCT current_update_id
        FROM ${accessLog}
        WHERE
          project_id = ${projectId}
          AND created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
          AND current_update_id IS NOT NULL
      `);
      console.timeEnd("[STATS_ACCESS] step1-fetch-update-ids");

      const updateIds = updateIdRows
        .map((row) => row.current_update_id)
        .filter((id): id is string => id.length > 0);

      if (updateIds.length === 0) {
        console.timeEnd("[STATS_ACCESS] total");
        return [];
      }

      console.time("[STATS_ACCESS] step2-query-daily");
      type StatsRow = {
        date: string | Date;
        count: number | string;
        runtimeVersion: string | null;
        isEmbed: boolean;
      };

      const dailyStatsByUpdateId = new Map<string, StatsRow[]>();

      await pMap(
        updateIds,
        async (updateId) => {
          const rows = await db.execute<StatsRow>(sql`
            SELECT
              (created_at AT TIME ZONE ${timezone})::date AS date,
              COUNT(DISTINCT client_id) AS count,
              MAX(runtime_version) AS "runtimeVersion",
              BOOL_OR(current_update_id = embedded_update_id) AS "isEmbed"
            FROM ${accessLog}
            WHERE
              project_id = ${projectId}
              AND created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
              AND current_update_id = ${updateId}
            GROUP BY 1
            ORDER BY 1 ASC
          `);

          if (rows.length > 0) {
            dailyStatsByUpdateId.set(updateId, rows);
          }
        },
        { concurrency: 5 },
      );
      console.timeEnd("[STATS_ACCESS] step2-query-daily");

      console.time("[STATS_ACCESS] step3-combine-results");

      const updateIdSet = new Set(
        Array.from(dailyStatsByUpdateId.keys()).filter((id) =>
          UUID_REGEX.test(id),
        ),
      );

      const deploymentMapping: Record<string, string> = {};

      if (updateIdSet.size > 0) {
        const mappingRows = await db
          .select()
          .from(activeDeploymentHistory)
          .where(
            sql`${activeDeploymentHistory.updateId} IN (${sql.join(
              Array.from(updateIdSet).map((id) => sql`${id}::UUID`),
              sql`, `,
            )})`,
          );

        for (const record of mappingRows) {
          if (record.updateId && record.deploymentId) {
            deploymentMapping[record.updateId] = record.deploymentId;
          }
        }
      }

      const result: StatsResult[] = [];

      for (const [updateId, rows] of dailyStatsByUpdateId) {
        for (const row of rows) {
          let version: string;
          if (row.isEmbed) {
            version = "embed";
          } else {
            version = deploymentMapping[updateId] ?? "unknown";
          }

          result.push({
            date: row.date instanceof Date ? row.date : new Date(row.date),
            version,
            count:
              typeof row.count === "string"
                ? Number.parseInt(row.count, 10)
                : row.count,
            runtimeVersion: row.runtimeVersion ?? "unknown",
          });
        }
      }

      result.sort((a, b) => {
        const dateCompare = b.date.getTime() - a.date.getTime();
        if (dateCompare !== 0) {
          return dateCompare;
        }

        return a.version.localeCompare(b.version);
      });
      console.timeEnd("[STATS_ACCESS] step3-combine-results");

      console.timeEnd("[STATS_ACCESS] total");

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
