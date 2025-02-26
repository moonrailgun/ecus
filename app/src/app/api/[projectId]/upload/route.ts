import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { processZipFile } from "@/server/file/utils";
import { createDeploymentAndUploadFiles } from "@/server/api/deployment";
import { z } from "zod";
import { gitInfoSchema } from "@/server/api/expo/schema";

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

  try {
    const urlParams = await params;
    const projectId = urlParams.projectId;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = (formData.get("name") as string) ?? file.name;
    const gitInfo: z.infer<typeof gitInfoSchema> = JSON.parse(
      (formData.get("gitInfo") as string) ?? "{}",
    );

    console.log("file", file.type);

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

    const { id, list } = await createDeploymentAndUploadFiles(
      projectId,
      session.user.id,
      filelist,
      gitInfo,
    );

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
