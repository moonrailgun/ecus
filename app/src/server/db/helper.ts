import { db } from ".";
import { accessLog, auditLog } from "./schema";

export async function createAccessLog(
  projectId: string,
  platform: string | null,
  clientId: string | null,
  runtimeVersion: string | null,
  channelName: string | null,
  currentUpdateId: string | null,
  embeddedUpdateId: string | null,
) {
  try {
    await db.insert(accessLog).values({
      projectId,
      platform,
      clientId,
      runtimeVersion,
      channelName,
      currentUpdateId,
      embeddedUpdateId,
    });
  } catch (err) {
    console.log("insert access log error:", err);
  }
}

export async function createAuditLog(
  projectId: string,
  userId: string,
  content = "",
  metadata: Record<string, unknown> = {},
) {
  try {
    await db.insert(auditLog).values({
      projectId,
      userId,
      content,
      metadata,
    });
  } catch (err) {
    console.error("create audit log failed:", err);
  }
}
