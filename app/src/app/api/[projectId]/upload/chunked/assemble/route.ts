import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { createReadStream, createWriteStream, unlink } from "fs";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { createId } from "@paralleldrive/cuid2";
import { promisify } from "util";
import { pipeline } from "stream";
import { handleZipFile } from "../../_handleZipFile";
import { ensureTempDir, TEMP_UPLOAD_DIR } from "@/server/utils";
import { logMemoryUsage } from "@/server/utils/memoryDiagnostics";
import { type gitInfoSchema } from "@/server/api/expo/schema";
import { type z } from "zod";
import { randomUUID } from "crypto";

const pipelineAsync = promisify(pipeline);
const unlinkAsync = promisify(unlink);

/**
 * Assemble uploaded chunk files
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  let projectId: string | undefined;
  let uploadId: string | undefined;

  const session = await getSession(request.headers);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      uploadId?: string;
      filename?: string;
      gitInfo: z.infer<typeof gitInfoSchema>;
      metadata?: Record<string, unknown> | null;
      promote?: string | null;
    };
    uploadId = body.uploadId;
    const { filename, gitInfo } = body;
    const metadata = body.metadata ?? null;
    const promote = body.promote ?? null;
    projectId = (await params).projectId;

    logMemoryUsage("upload.chunked.assemble.start", {
      requestId,
      projectId,
      uploadId,
      filename,
      contentLengthBytes: request.headers.get("content-length"),
      promoteChannelName: promote,
      hasMetadata: Boolean(metadata),
    });

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId parameter" },
        { status: 400 },
      );
    }

    if (!filename) {
      return NextResponse.json(
        { error: "Missing filename parameter" },
        { status: 400 },
      );
    }

    const currentUploadId = uploadId;
    const currentFilename = filename;

    await ensureTempDir();

    const files = await readdir(TEMP_UPLOAD_DIR);
    const chunks = files
      .filter(
        (file: string) =>
          file.startsWith(currentUploadId) && file.endsWith(".chunk"),
      )
      .map((filename) => {
        // Extract chunk index from filename, format: uploadId_index.chunk
        const indexStr = filename
          .replace(`${currentUploadId}_`, "")
          .replace(".chunk", "");
        return {
          path: join(TEMP_UPLOAD_DIR, filename),
          index: parseInt(indexStr, 10),
        };
      })
      .sort((a, b) => a.index - b.index); // Sort by index

    logMemoryUsage("upload.chunked.assemble.chunks", {
      requestId,
      projectId,
      uploadId,
      chunkCount: chunks.length,
    });

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No chunks found for the specified uploadId" },
        { status: 404 },
      );
    }

    const finalFilename = `${createId()}_${currentFilename}`;
    const finalFilePath = join(TEMP_UPLOAD_DIR, finalFilename);
    const outputStream = createWriteStream(finalFilePath);

    for (const chunk of chunks) {
      const chunkStream = createReadStream(chunk.path);
      await pipelineAsync(chunkStream, outputStream, { end: false });
    }

    outputStream.end();

    for (const chunk of chunks) {
      await unlinkAsync(chunk.path);
    }

    logMemoryUsage("upload.chunked.assemble.beforeReadFinalZip", {
      requestId,
      projectId,
      uploadId,
      chunkCount: chunks.length,
    });

    const file = await readFile(finalFilePath);

    logMemoryUsage("upload.chunked.assemble.buffered", {
      requestId,
      projectId,
      uploadId,
      zipBytes: file.byteLength,
    });

    const response = await handleZipFile({
      file,
      projectId,
      userId: session.user.id,
      gitInfo,
      metadata,
      promoteChannelName: promote,
      requestId,
      source: "chunked-assemble",
    });

    logMemoryUsage("upload.chunked.assemble.finish", {
      requestId,
      projectId,
      uploadId,
      durationMs: Date.now() - startedAt,
      responseStatus: response.status,
    });

    return response;
  } catch (error) {
    logMemoryUsage("upload.chunked.assemble.error", {
      requestId,
      projectId,
      uploadId,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });

    console.error("Error assembling chunks:", error);
    return NextResponse.json(
      { error: "Failed to assemble chunks", details: String(error) },
      { status: 500 },
    );
  }
}
