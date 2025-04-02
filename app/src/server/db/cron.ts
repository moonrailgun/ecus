import { Cron } from "croner";
import { sql } from "drizzle-orm";
import { db } from ".";
import { accessLog } from "./schema";
import { env } from "@/env";
import dayjs from "dayjs";

// Get the maximum number of days to retain, default is 30 days
const RETENTION_DAYS = env.ACCESS_LOG_RETENTION_DAYS
  ? Number(env.ACCESS_LOG_RETENTION_DAYS)
  : 30;

/**
 * Clean up old access log records
 * This function will delete access log records older than the specified number of days
 */
async function cleanupAccessLogs() {
  const cutoffDate = dayjs().subtract(RETENTION_DAYS, "day").toDate();

  try {
    // Build delete query, delete access logs earlier than the cutoff date
    const result = await db
      .delete(accessLog)
      .where(sql`${accessLog.createdAt} < ${cutoffDate}`);

    console.log(
      `Successfully cleaned access logs: Deleted ${result.count ?? "unknown number of"} records older than ${RETENTION_DAYS} days`,
    );
  } catch (error) {
    console.error("Error occurred while cleaning access logs:", error);
  }
}

// Create a cron job that runs once per hour
export const accessLogCleanupJob = new Cron(
  "0 * * * *",
  {
    name: "access-log-cleanup",
    timezone: "UTC",
  },
  cleanupAccessLogs,
);

// Export initialization function, called when the server starts
export function initCronJobs() {
  console.log(
    `Access log cleanup task started, will retain records from the last ${RETENTION_DAYS} days`,
  );

  // Ensure cron jobs are stopped when the server shuts down
  process.on("SIGTERM", () => {
    accessLogCleanupJob.stop();
    console.log("Access log cleanup task stopped");
  });
}
