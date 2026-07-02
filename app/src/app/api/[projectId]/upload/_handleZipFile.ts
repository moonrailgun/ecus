import {
  createDeploymentAndUploadFiles,
  findChannelByName,
  promoteDeployment,
  updateDeploymentMetadata,
} from "@/server/api/deployment";
import { type gitInfoSchema } from "@/server/api/expo/schema";
import { processZipFile } from "@/server/file/utils";
import { logMemoryUsage } from "@/server/utils/memoryDiagnostics";
import { NextResponse } from "next/server";
import { type z } from "zod";

interface HandleZipFileProps {
  file: Buffer<ArrayBufferLike>;
  projectId: string;
  userId: string;
  gitInfo: z.infer<typeof gitInfoSchema>;
  metadata: Record<string, unknown> | null;
  promoteChannelName: string | null;
  requestId?: string;
  source?: string;
}

export async function handleZipFile(props: HandleZipFileProps) {
  const {
    file,
    projectId,
    userId,
    gitInfo,
    metadata,
    promoteChannelName,
    requestId,
    source,
  } = props;
  const startedAt = Date.now();

  try {
    logMemoryUsage("upload.handleZip.start", {
      requestId,
      source,
      projectId,
      zipBytes: file.byteLength,
    });

    const filelist = await processZipFile(file);

    logMemoryUsage("upload.handleZip.extracted", {
      requestId,
      source,
      projectId,
      fileCount: filelist.length,
      durationMs: Date.now() - startedAt,
    });

    if (!filelist.some((f) => f.name === "metadata.json")) {
      return NextResponse.json(
        { error: "Its not a react native bundle" },
        { status: 400 },
      );
    }

    if (!filelist.some((f) => f.name === "expoConfig.json")) {
      return NextResponse.json(
        { error: "Its not a expo bundle" },
        { status: 400 },
      );
    }

    logMemoryUsage("upload.handleZip.beforeUploadFiles", {
      requestId,
      source,
      projectId,
      fileCount: filelist.length,
    });

    const { id, list, deployment } = await createDeploymentAndUploadFiles(
      projectId,
      userId,
      filelist,
      gitInfo,
    );

    logMemoryUsage("upload.handleZip.filesUploaded", {
      requestId,
      source,
      projectId,
      deploymentId: id,
      fileCount: list.length,
      durationMs: Date.now() - startedAt,
    });

    if (metadata) {
      await updateDeploymentMetadata(deployment.id, metadata, userId);
    }

    if (promoteChannelName && deployment.runtimeVersion) {
      // if use promote in upload, then run promote logic when upload finished
      const channelId = await findChannelByName(
        projectId,
        promoteChannelName,
      ).then((res) => res?.id);

      if (!channelId) {
        return NextResponse.json(
          { error: `This channel [${promoteChannelName}] not found` },
          { status: 400 },
        );
      }

      if (channelId) {
        await promoteDeployment(
          projectId,
          deployment.runtimeVersion,
          deployment.id,
          channelId,
          userId,
        );
      }
    }

    logMemoryUsage("upload.handleZip.finish", {
      requestId,
      source,
      projectId,
      deploymentId: id,
      promoted: Boolean(promoteChannelName),
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      id,
      list,
    });
  } catch (err) {
    logMemoryUsage("upload.handleZip.error", {
      requestId,
      source,
      projectId,
      durationMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      { error: "handle zip file failed", detail: String(err) },
      { status: 500 },
    );
  }
}
