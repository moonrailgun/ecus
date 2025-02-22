import { db } from "@/server/db";
import { count, desc, eq, sql, SQL } from "drizzle-orm";
import { get } from "lodash-es";
import { type NextRequest, NextResponse } from "next/server";
import { resourceMap } from "./_resource";
import { activeDeployments, deployments } from "@/server/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  const searchParams = request.nextUrl.searchParams;
  // const sort = String(searchParams.get('_sort'))
  // const order = String(searchParams.get('_order'))
  const start = Number(searchParams.get("_start") ?? 0);
  const end = Number(searchParams.get("_end") ?? 20);

  if (resource in resourceMap) {
    const table = resourceMap[resource]!;
    let where: SQL = sql`1 = 1`;

    if (resource === "deployment") {
      const projectId = searchParams.get("projectId");
      if (projectId) {
        where = eq(deployments.projectId, projectId);
      }
    }
    if (resource === "active") {
      const projectId = searchParams.get("projectId");
      if (projectId) {
        where = eq(activeDeployments.projectId, projectId);
      }
    }

    const [res, rowCount] = await Promise.all([
      db
        .select()
        .from(table)
        .where(where)
        .limit(end - start)
        .offset(start)
        .orderBy(desc((table as any).createdAt ?? (table as any).id)),
      db.select({ count: count() }).from(table).where(where),
    ]);

    return NextResponse.json(res, {
      headers: {
        "x-total-count": String(get(rowCount, [0, "count"])),
      },
    });
  }

  return NextResponse.json({ error: "Unknown resouce" }, { status: 400 });
}
