import { uploadFile } from "@/server/file/client";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { processZipFile } from "@/server/file/utils";
import fs from "fs/promises";
import { createDeploymentWithFileList } from "@/server/api/deployment";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth();

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

    const id = await createDeploymentWithFileList(
      projectId,
      session.user.id,
      filelist,
    );

    const dir = `ecus/${projectId}/updates/${id}`;

    await Promise.all(
      filelist.map(async (f) => {
        const key = `${dir}/${f.name}`;
        const file = await fs.readFile(f.path);

        await uploadFile(key, file);
      }),
    );

    return NextResponse.json({
      id,
      filelist: filelist.map((f) => ({
        name: f.name,
        key: `${dir}/${f.name}`,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Upload failed", detail: String(err) },
      { status: 500 },
    );
  }
}
