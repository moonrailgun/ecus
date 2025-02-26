import { NextResponse } from "next/server";
import { getFile } from "@/server/file/client";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      projectId: string;
      deploymentId: string;
      keys: string[];
    }>;
  },
): Promise<Response> {
  try {
    const { projectId, deploymentId, keys } = await params;
    const key = Array.isArray(keys) ? keys.join("/") : String(keys);

    if (!key) {
      return NextResponse.json({ error: "Missing file key" }, { status: 400 });
    }

    const { body, contentType } = await getFile(
      `ecus/${projectId}/updates/${deploymentId}/${key}`,
    );

    if (!body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return new Response(body as ReadableStream, {
      headers: {
        "Content-Type": contentType ?? "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error fetching file from S3:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
