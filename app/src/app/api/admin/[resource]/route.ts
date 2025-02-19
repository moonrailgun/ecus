import { db } from "@/server/db";
import { deployment } from "@/server/db/schema";
import { count, desc } from "drizzle-orm";
import { get } from "lodash-es";
import { type NextRequest, NextResponse } from "next/server";

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

  if (resource === "deployment") {
    const [res, rowCount] = await Promise.all([
      db.query.deployment.findMany({
        orderBy: [desc(deployment.id)],
        limit: end - start,
        offset: start,
      }),
      db.select({ count: count() }).from(deployment),
    ]);

    return NextResponse.json(res, {
      headers: {
        "x-total-count": String(get(rowCount, [0, "count"])),
      },
    });
  }
}
