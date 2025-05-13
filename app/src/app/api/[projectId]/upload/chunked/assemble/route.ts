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

const pipelineAsync = promisify(pipeline);
const unlinkAsync = promisify(unlink);

/**
 * Assemble uploaded chunk files
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } },
) {
  const session = await getSession(request.headers);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { uploadId, filename, gitInfo, metadata, promote } =
    await request.json();

  const projectId = params.projectId;

  try {
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

    await ensureTempDir();

    const files = await readdir(TEMP_UPLOAD_DIR);
    const chunks = files
      .filter(
        (file: string) => file.startsWith(uploadId) && file.endsWith(".chunk"),
      )
      .map((filename) => {
        // Extract chunk index from filename, format: uploadId_index.chunk
        const indexStr = filename
          .replace(`${uploadId}_`, "")
          .replace(".chunk", "");
        return {
          path: join(TEMP_UPLOAD_DIR, filename),
          index: parseInt(indexStr, 10),
        };
      })
      .sort((a, b) => a.index - b.index); // Sort by index

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No chunks found for the specified uploadId" },
        { status: 404 },
      );
    }

    const finalFilename = `${createId()}_${filename}`;
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

    const file = await readFile(finalFilePath);

    return handleZipFile({
      file,
      projectId,
      userId: session.user.id,
      gitInfo,
      metadata,
      promoteChannelName: promote,
    });
  } catch (error) {
    console.error("Error assembling chunks:", error);
    return NextResponse.json(
      { error: "Failed to assemble chunks", details: String(error) },
      { status: 500 },
    );
  }
}
