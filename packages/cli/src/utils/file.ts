import got, { Options, Progress } from "got";
import cliProgress from "cli-progress";
import fs from "fs";
import path from "path";

export async function uploadWithProgress(
  url: string,
  requestOptions: Options & { isStream?: true },
): Promise<string> {
  const res = got.stream.put(url, requestOptions);

  const uploadBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  uploadBar.start(100, 0);

  const stopProgress = () => {
    uploadBar.stop();
  };

  res.on("uploadProgress", (progress: Progress) => {
    if (progress.total) {
      uploadBar.setTotal(progress.total);
      uploadBar.update(progress.transferred);
    } else {
      uploadBar.setTotal(100);
      uploadBar.update(progress.percent);
    }

    if (progress.percent >= 100) {
      stopProgress();
    }
  });

  const chunks: Buffer[] = [];
  res.on("data", (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    res.on("end", () => {
      stopProgress();
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
    res.on("error", (err) => {
      reject(err);
    });
  });
}
/**
 * Chunk upload file
 * @param baseUrl API base URL
 * @param filePath File path
 * @param authHeaders Authentication headers
 * @param projectId Project ID
 * @returns Upload result
 */
export async function chunkUploadFile(
  baseUrl: string,
  filePath: string,
  authHeaders: Record<string, string>,
  projectId: string,
  updateData: {
    gitInfo: Record<string, any>;
    metadata: Record<string, any> | undefined;
    promote: string | undefined;
  },
): Promise<any> {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size
  const uploadId = Date.now().toString(); // Generate upload ID
  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;
  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

  const uploadBar = new cliProgress.SingleBar(
    {
      format:
        "Uploading [{bar}] {percentage}% | {value}/{total} Chunks | {status}",
    },
    cliProgress.Presets.shades_classic,
  );
  uploadBar.start(totalChunks, 0, { status: "Starting..." });

  try {
    for (let i = 0; i < totalChunks; i++) {
      uploadBar.update(i, {
        status: `Uploading chunk ${i + 1}/${totalChunks}`,
      });

      const chunkBuffer = await readFileChunk(
        filePath,
        i * CHUNK_SIZE,
        CHUNK_SIZE,
      );

      const result = await uploadChunk(
        baseUrl,
        chunkBuffer,
        uploadId,
        i,
        totalChunks,
        authHeaders,
        projectId,
      );

      if (!result.success) {
        throw new Error(`Chunk upload failed: ${result.error}`);
      }
    }

    // All chunks uploaded, assemble file
    uploadBar.update(totalChunks, { status: "Assembling file..." });
    const assembleResult = await assembleChunks(
      baseUrl,
      uploadId,
      fileName,
      authHeaders,
      projectId,
      updateData,
    );

    uploadBar.stop();

    return assembleResult;
  } catch (error) {
    uploadBar.stop();
    console.error("Upload error:", error);
    await cleanupChunks(baseUrl, uploadId, authHeaders, projectId);
    throw error;
  }
}

/**
 * Read a specific chunk of a file
 */
async function readFileChunk(
  filePath: string,
  start: number,
  chunkSize: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const fileHandle = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(chunkSize);

    fs.read(fileHandle, buffer, 0, chunkSize, start, (err, bytesRead) => {
      fs.closeSync(fileHandle);

      if (err) {
        reject(err);
        return;
      }

      // If the number of bytes read is less than chunkSize, it means the end of the file has been reached, trim the buffer
      resolve(bytesRead < chunkSize ? buffer.slice(0, bytesRead) : buffer);
    });
  });
}

/**
 * Upload a single chunk
 */
async function uploadChunk(
  baseUrl: string,
  chunk: Buffer,
  uploadId: string,
  chunkIndex: number,
  totalChunks: number,
  authHeaders: Record<string, string>,
  projectId: string,
): Promise<any> {
  try {
    const response = await got.patch(
      `${baseUrl}/api/${projectId}/upload/chunked`,
      {
        headers: {
          ...authHeaders,
          "upload-id": uploadId,
          "chunk-index": chunkIndex.toString(),
          "total-chunks": totalChunks.toString(),
        },
        body: chunk,
      },
    );

    return JSON.parse(response.body);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to upload chunk ${chunkIndex}:`, error.message);
    }
    throw error;
  }
}

/**
 * Assemble uploaded chunks
 */
async function assembleChunks(
  baseUrl: string,
  uploadId: string,
  filename: string,
  authHeaders: Record<string, string>,
  projectId: string,
  updateData: {
    gitInfo: Record<string, any>;
    metadata: Record<string, any> | undefined;
    promote: string | undefined;
  },
): Promise<any> {
  try {
    const response = await got.post(
      `${baseUrl}/api/${projectId}/upload/chunked/assemble`,
      {
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        json: {
          uploadId,
          filename,
          ...updateData,
        },
      },
    );

    return JSON.parse(response.body);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to assemble chunks:", error.message);
    }
    throw error;
  }
}

/**
 * Clean up chunk files
 */
async function cleanupChunks(
  baseUrl: string,
  uploadId: string,
  authHeaders: Record<string, string>,
  projectId: string,
): Promise<any> {
  try {
    const response = await got.delete(
      `${baseUrl}/api/${projectId}/upload/chunked?uploadId=${uploadId}`,
      {
        headers: authHeaders,
      },
    );

    return JSON.parse(response.body);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to cleanup chunks:", error.message);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
