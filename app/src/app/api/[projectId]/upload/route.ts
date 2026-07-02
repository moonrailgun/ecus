import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { type z } from "zod";
import { type gitInfoSchema } from "@/server/api/expo/schema";
import { handleZipFile } from "./_handleZipFile";
import { logMemoryUsage } from "@/server/utils/memoryDiagnostics";
import { randomUUID } from "crypto";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  let projectId: string | undefined;
  const session = await getSession(request.headers);

  if (!session) {
    return NextResponse.json(
      {
        error: "Need to login first",
      },
      {
        status: 402,
      },
    );
  }

  const userId = session.user.id;

  try {
    const urlParams = await params;
    projectId = urlParams.projectId;

    logMemoryUsage("upload.put.start", {
      requestId,
      projectId,
      contentLengthBytes: request.headers.get("content-length"),
    });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null) ?? file?.name;
    const promote = formData.get("promote") as string | null;
    const metadata = formData.get("metadata") as string | null;
    const gitInfo: z.infer<typeof gitInfoSchema> = JSON.parse(
      (formData.get("gitInfo") as string) ?? "{}",
    );

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    logMemoryUsage("upload.put.formData", {
      requestId,
      projectId,
      fileName: file.name,
      fileSizeBytes: file.size,
      promoteChannelName: promote,
      hasMetadata: Boolean(metadata),
    });

    if (file.type !== "application/zip") {
      return NextResponse.json(
        { error: "Need to upload zip file" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "No file name provide" },
        { status: 400 },
      );
    }

    let metadataJson: Record<string, unknown> | null = null;
    if (metadata && typeof metadata === "string") {
      try {
        metadataJson = JSON.parse(metadata);
      } catch (err) {
        console.error("Update metadata failed", err);
        return NextResponse.json(
          {
            error: `Update metadata failed, please ensure metadata is valid json string`,
          },
          { status: 400 },
        );
      }
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    logMemoryUsage("upload.put.buffered", {
      requestId,
      projectId,
      zipBytes: fileBuffer.byteLength,
    });

    const response = await handleZipFile({
      file: fileBuffer,
      projectId,
      userId,
      gitInfo,
      metadata: metadataJson,
      promoteChannelName: promote,
      requestId,
      source: "put",
    });

    logMemoryUsage("upload.put.finish", {
      requestId,
      projectId,
      durationMs: Date.now() - startedAt,
      responseStatus: response.status,
    });

    return response;
  } catch (err) {
    logMemoryUsage("upload.put.error", {
      requestId,
      projectId,
      durationMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      { error: "Upload failed", detail: String(err) },
      { status: 500 },
    );
  }
}
