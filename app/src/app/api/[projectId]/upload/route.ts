import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { processZipFile } from "@/server/file/utils";
import {
  createDeploymentAndUploadFiles,
  findChannelByName,
  promoteDeployment,
  updateDeploymentMetadata,
} from "@/server/api/deployment";
import { type z } from "zod";
import { type gitInfoSchema } from "@/server/api/expo/schema";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
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
    const projectId = urlParams.projectId;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = (formData.get("name") as string) ?? file.name;
    const promote = formData.get("promote") as string | null;
    const metadata = formData.get("metadata") as string | null;
    const gitInfo: z.infer<typeof gitInfoSchema> = JSON.parse(
      (formData.get("gitInfo") as string) ?? "{}",
    );

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

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
      session.user.id,
      filelist,
      gitInfo,
    );

    if (metadata && typeof metadata === "string") {
      try {
        const json = JSON.parse(metadata);
        await updateDeploymentMetadata(deployment.id, json, userId);
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

    if (promote && deployment.runtimeVersion) {
      // if use promote in upload, then run promote logic when upload finished
      const channelId = await findChannelByName(projectId, promote).then(
        (res) => res?.id,
      );

      if (!channelId) {
        return NextResponse.json(
          { error: `This channel [${promote}] not found` },
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
    return NextResponse.json(
      { error: "Upload failed", detail: String(err) },
      { status: 500 },
    );
  }
}
