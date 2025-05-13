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
import { handleZipFile } from "./_handleZipFile";

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

    return handleZipFile({
      file: fileBuffer,
      projectId,
      userId,
      gitInfo,
      metadata: metadataJson,
      promoteChannelName: promote,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed", detail: String(err) },
      { status: 500 },
    );
  }
}
