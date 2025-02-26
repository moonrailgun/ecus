import { db } from ".";
import { auditLog } from "./schema";

export async function createAuditLog(
  projectId: string,
  userId: string,
  content = "",
  metadata: Record<string, unknown> = {},
) {
  await db.insert(auditLog).values({
    projectId,
    userId,
    content,
    metadata,
  });
}
