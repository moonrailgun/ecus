import {
  createDeploymentAndUploadFiles,
  findChannelByName,
  promoteDeployment,
  updateDeploymentMetadata,
} from "@/server/api/deployment";
import { type gitInfoSchema } from "@/server/api/expo/schema";
import { processZipFile } from "@/server/file/utils";
import { NextResponse } from "next/server";
import { type z } from "zod";

interface HandleZipFileProps {
  file: Buffer<ArrayBufferLike>;
  projectId: string;
  userId: string;
  gitInfo: z.infer<typeof gitInfoSchema>;
  metadata: Record<string, unknown> | null;
  promoteChannelName: string | null;
}

export async function handleZipFile(props: HandleZipFileProps) {
  const { file, projectId, userId, gitInfo, metadata, promoteChannelName } =
    props;

  try {
    const filelist = await processZipFile(file);

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

    const { id, list, deployment } = await createDeploymentAndUploadFiles(
      projectId,
      userId,
      filelist,
      gitInfo,
    );

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

    return NextResponse.json({
      id,
      list,
    });
  } catch (err) {
    NextResponse.json(
      { error: "handle zip file failed", detail: String(err) },
      { status: 500 },
    );
  }
}
