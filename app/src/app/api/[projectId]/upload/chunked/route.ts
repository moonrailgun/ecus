import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { createWriteStream } from "fs";
import { join } from "path";
import { Readable } from "stream";
import { promisify } from "util";
import { pipeline } from "stream";
import { ensureTempDir, TEMP_UPLOAD_DIR } from "@/server/utils";

const pipelineAsync = promisify(pipeline);

// Handle chunked uploads with resumability
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  // Ensure authentication
  const session = await getSession(request.headers);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const projectId = (await params).projectId;

  // Get upload metadata from headers
  const uploadId = request.headers.get("upload-id");
  const chunkIndex = request.headers.get("chunk-index");
  const totalChunks = request.headers.get("total-chunks");

  if (!uploadId || !chunkIndex || !totalChunks) {
    return NextResponse.json(
      { error: "Missing required headers for chunked upload" },
      { status: 400 },
    );
  }

  try {
    // Ensure temp directory exists
    await ensureTempDir();

    // Create chunk filename
    const chunkFilename = `${uploadId}_${chunkIndex}.chunk`;
    const chunkFilePath = join(TEMP_UPLOAD_DIR, chunkFilename);

    // Process the chunk
    const fileBuffer = await request.arrayBuffer();

    // Create a readable stream from the buffer
    const readableStream = new Readable();
    readableStream.push(Buffer.from(fileBuffer));
    readableStream.push(null);

    // Create a write stream to the chunk file
    const writeStream = createWriteStream(chunkFilePath);

    // Process the stream
    await pipelineAsync(readableStream, writeStream);

    // Check if this is the last chunk
    if (Number(chunkIndex) === Number(totalChunks) - 1) {
      // Return success with completion status
      return NextResponse.json({
        success: true,
        status: "completed",
        uploadId,
        projectId,
      });
    } else {
      // Return success for this chunk
      return NextResponse.json({
        success: true,
        status: "in-progress",
        chunkIndex,
        uploadId,
        projectId,
      });
    }
  } catch (error) {
    console.error("Error processing chunk upload:", error);
    return NextResponse.json(
      { error: "Failed to process chunk upload", details: String(error) },
      { status: 500 },
    );
  }
}
