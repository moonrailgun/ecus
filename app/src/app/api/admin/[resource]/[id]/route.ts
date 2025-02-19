import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";
import { resourceMap } from "../_resource";
import { users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  const { resource, id } = await params;

  if (resource in resourceMap) {
    const table = resourceMap[resource]!;
    const record = await db
      .select()
      .from(table)
      .where(sql`id = ${id}`)
      .limit(1);

    if (record[0]) {
      return NextResponse.json(record[0]);
    } else {
      return NextResponse.json("not found", {
        status: 404,
      });
    }
  }

  return NextResponse.json({ error: "Unknown resouce" }, { status: 400 });
}
